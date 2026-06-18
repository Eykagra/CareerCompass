import os
import re
import jwt
import httpx
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Initialize DB
from db import (
    init_db,
    list_maps,
    count_maps,
    get_map,
    create_map,
    update_map_completed,
    delete_map,
    FREE_MAP_LIMIT
)
init_db()

# LLM integration
from llm import (
    get_provider,
    active_provider_name,
    extract_json,
    LLMError,
    ROADMAP_SYSTEM,
    roadmap_user_prompt,
    MENTOR_SYSTEM,
    build_mentor_messages,
    INTAKE_SYSTEM,
    intake_user_prompt,
)
from sample import demo_roadmap, demo_mentor_reply
from schemas import UserProfile, RoadmapGraph, ChatMessage

app = FastAPI(title="CareerCompass API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in prod if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Configs
AUTH_SECRET = os.getenv("AUTH_SECRET", "careercompass-super-secret-key-change-in-prod")
AUTH_GOOGLE_ID = os.getenv("AUTH_GOOGLE_ID")
AUTH_GOOGLE_SECRET = os.getenv("AUTH_GOOGLE_SECRET")
COOKIE_NAME = "session_token"

# Helper for current user from JWT cookie
async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = jwt.decode(token, AUTH_SECRET, algorithms=["HS256"])
        user = payload.get("user")
        if not user or not user.get("email"):
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

# Helper for optional user (does not raise 401)
async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        payload = jwt.decode(token, AUTH_SECRET, algorithms=["HS256"])
        return payload.get("user")
    except jwt.PyJWTError:
        return None

# --- AUTH ROUTES ---

@app.get("/api/auth/login")
async def auth_login(request: Request, callback_url: Optional[str] = None):
    """
    Initiates Google OAuth 2.0 flow.
    """
    if not AUTH_GOOGLE_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured in backend.")
    
    # Resolve redirect URI
    auth_url_env = os.getenv("AUTH_URL")
    if auth_url_env:
        redirect_uri = f"{auth_url_env.rstrip('/')}/api/auth/callback/google"
    else:
        redirect_uri = f"{request.url.scheme}://{request.url.netloc}/api/auth/callback/google"

    # Save state if needed, or pass callback_url in state
    state = callback_url or "/app"
    
    google_oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code"
        f"&client_id={AUTH_GOOGLE_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=openid%20email%20profile"
        f"&state={state}"
    )
    return RedirectResponse(google_oauth_url)

@app.get("/api/auth/callback/google")
async def auth_callback(request: Request, response: Response, code: str = None, state: Optional[str] = None):
    """
    Handles redirect callback from Google OAuth.
    """
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing")

    auth_url_env = os.getenv("AUTH_URL")
    if auth_url_env:
        redirect_uri = f"{auth_url_env.rstrip('/')}/api/auth/callback/google"
    else:
        redirect_uri = f"{request.url.scheme}://{request.url.netloc}/api/auth/callback/google"

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": AUTH_GOOGLE_ID,
        "client_secret": AUTH_GOOGLE_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        # 1. Exchange authorization code for tokens
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to retrieve Google token: {token_res.text}")
        
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        # 2. Get user profile info
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_res = await client.get(userinfo_url, headers=headers)
        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve Google userinfo")
        
        user_info = userinfo_res.json()
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Email not supplied by Google")

        # 3. Create JWT Session payload
        payload = {
            "user": {
                "name": name,
                "email": email,
                "image": picture
            },
            "exp": time.time() + (30 * 24 * 3600)  # 30 days
        }
        jwt_token = jwt.encode(payload, AUTH_SECRET, algorithm="HS256")
        
        # 4. Set HttpOnly Cookie & Redirect
        # Ensure redirect stays within safety
        redirect_target = state if state and state.startswith("/") else "/app"
        
        is_prod = os.getenv("NODE_ENV") == "production"
        
        # We construct response manually so we can set cookie and redirect at the same time
        red_response = RedirectResponse(redirect_target)
        red_response.set_cookie(
            key=COOKIE_NAME,
            value=jwt_token,
            httponly=True,
            samesite="lax",
            secure=is_prod,
            max_age=30 * 24 * 3600  # 30 days
        )
        return red_response

@app.get("/api/auth/session")
async def auth_session(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    """
    Returns the current user profile session if authenticated (matching NextAuth session endpoint).
    """
    if not user:
        return {}
    return {"user": user}

@app.get("/api/auth/logout")
@app.post("/api/auth/logout")
@app.post("/api/auth/signout")
async def auth_logout(response: Response):
    """
    Logs out the user by clearing the session token cookie.
    """
    is_prod = os.getenv("NODE_ENV") == "production"
    # To delete cookie, we set max_age=0 or clear it
    res = JSONResponse({"ok": True})
    res.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=is_prod)
    return res

# --- API ROUTES ---

@app.get("/api/health")
async def api_health():
    return {
        "status": "ok",
        "provider": active_provider_name(),
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.post("/api/roadmap")
async def api_roadmap(profile: UserProfile):
    provider = get_provider()
    
    # Demo mode: no provider key configured
    if not provider:
        return {
            "roadmap": demo_roadmap(profile.model_dump()),
            "provider": "demo"
        }

    try:
        last_err = None
        # One retry on malformed JSON
        for attempt in range(2):
            raw = await provider.complete(
                system=ROADMAP_SYSTEM,
                messages=[{"role": "user", "content": roadmap_user_prompt(profile.model_dump())}],
                json_mode=True,
                temperature=0.7,
                max_tokens=2500
            )
            try:
                candidate = extract_json(raw)
                # Parse and validate with Pydantic
                validated = RoadmapGraph.model_validate(candidate)
                # Return by alias to preserve 'from' key in JSON edge objects
                return {
                    "roadmap": validated.model_dump(by_alias=True),
                    "provider": provider.name
                }
            except Exception as e:
                last_err = e
                print(f"Attempt {attempt + 1} failed to parse/validate: {str(e)}")
                
        raise LLMError(f"Model returned data that did not match the roadmap schema: {str(last_err)[:200]}")
        
    except Exception as err:
        status_code = err.status_code if isinstance(err, LLMError) else 502
        return JSONResponse(
            {"error": str(err) or "Generation failed"},
            status_code=status_code
        )

class MentorBody(BaseModel):
    profile: UserProfile
    roadmap: RoadmapGraph
    history: List[ChatMessage] = Field(default_factory=list)
    question: str = Field(..., min_length=1, max_length=2000)

@app.post("/api/mentor")
async def api_mentor(body: MentorBody):
    provider = get_provider()
    if not provider:
        return {
            "reply": demo_mentor_reply(body.question),
            "provider": "demo"
        }

    try:
        history_list = [msg.model_dump() for msg in body.history]
        messages = build_mentor_messages(
            body.profile.model_dump(),
            body.roadmap.model_dump(by_alias=True),
            history_list,
            body.question
        )
        
        reply = await provider.complete(
            system=MENTOR_SYSTEM,
            messages=messages,
            temperature=0.7,
            max_tokens=700
        )
        return {
            "reply": reply.strip(),
            "provider": provider.name
        }
    except Exception as err:
        status_code = err.status_code if isinstance(err, LLMError) else 502
        return JSONResponse(
            {"error": str(err) or "Mentor request failed"},
            status_code=status_code
        )

class IntakeBody(BaseModel):
    text: str = Field(..., min_length=2, max_length=4000)

@app.post("/api/intake")
async def api_intake(body: IntakeBody):
    provider = get_provider()
    if not provider:
        return JSONResponse(
            {"error": "Free-text intake needs an LLM key. Use the guided form instead."},
            status_code=503
        )

    try:
        raw = await provider.complete(
            system=INTAKE_SYSTEM,
            messages=[{"role": "user", "content": intake_user_prompt(body.text)}],
            json_mode=True,
            temperature=0.2,
            max_tokens=600
        )
        profile_json = extract_json(raw)
        validated_profile = UserProfile.model_validate(profile_json)
        return {
            "profile": validated_profile.model_dump(),
            "provider": provider.name
        }
    except Exception as err:
        status_code = err.status_code if isinstance(err, LLMError) else 502
        return JSONResponse(
            {"error": str(err) or "Intake parsing failed"},
            status_code=status_code
        )

# --- SAVE MAPS STORAGE ROUTES ---

@app.get("/api/maps")
async def api_list_maps(user: Dict[str, Any] = Depends(get_current_user)):
    email = user["email"]
    maps = list_maps(email)
    
    summary_list = []
    for m in maps:
        summary_list.append({
            "id": m["id"],
            "title": m["title"],
            "goal": m["goal"],
            "nodeCount": len(m["roadmap"].get("nodes", [])),
            "completedCount": len(m["completed"]),
            "createdAt": m["createdAt"],
            "updatedAt": m["updatedAt"]
        })
        
    return {
        "maps": summary_list,
        "limit": FREE_MAP_LIMIT,
        "remaining": max(0, FREE_MAP_LIMIT - len(summary_list))
    }

class CreateMapBody(BaseModel):
    profile: UserProfile
    roadmap: RoadmapGraph
    completed: Optional[List[str]] = Field(default_factory=list)

@app.post("/api/maps")
async def api_create_map(body: CreateMapBody, user: Dict[str, Any] = Depends(get_current_user)):
    email = user["email"]
    
    if count_maps(email) >= FREE_MAP_LIMIT:
        return JSONResponse(
            {
                "error": f"Free plan is limited to {FREE_MAP_LIMIT} saved maps. Delete one to save a new roadmap.",
                "code": "LIMIT_REACHED"
            },
            status_code=403
        )

    # Convert mapping properties to standard dicts
    profile_dict = body.profile.model_dump()
    roadmap_dict = body.roadmap.model_dump(by_alias=True)
    completed_list = body.completed
    
    map_obj = create_map(email, profile_dict, roadmap_dict, completed_list)
    return {"map": map_obj}

@app.get("/api/maps/{map_id}")
async def api_get_map(map_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    email = user["email"]
    map_obj = get_map(email, map_id)
    if not map_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return {"map": map_obj}

class PatchMapBody(BaseModel):
    completed: List[str]

@app.patch("/api/maps/{map_id}")
async def api_patch_map(map_id: str, body: PatchMapBody, user: Dict[str, Any] = Depends(get_current_user)):
    email = user["email"]
    map_obj = update_map_completed(email, map_id, body.completed)
    if not map_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return {"map": map_obj}

@app.delete("/api/maps/{map_id}")
async def api_delete_map(map_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    email = user["email"]
    ok = delete_map(email, map_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# --- STATIC FILES & SPA FALLBACK ---

# Mount assets directory (if frontend/dist exists)
assets_path = os.path.join(os.getcwd(), "frontend", "dist")
if os.path.exists(os.path.join(assets_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(assets_path, "assets")), name="assets")

# Fallback for client-side routing (React Router)
@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    # Skip api calls
    if catchall.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    index_file = os.path.join(assets_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return JSONResponse(
        {
            "message": "FastAPI is running! The React frontend is not yet built. Please build the frontend to see the app."
        }
    )
