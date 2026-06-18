import os
import re
import json
import httpx
import asyncio
from typing import List, Dict, Any, Optional

class LLMError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code

class LLMProvider:
    name: str
    async def complete(
        self,
        system: str,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        raise NotImplementedError()

class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def complete(
        self,
        system: str,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        contents = []
        for m in messages:
            role = "model" if m["role"] == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": m["content"]}]
            })

        body = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": contents,
            "generationConfig": {
                "temperature": temperature if temperature is not None else 0.6,
                "maxOutputTokens": max_tokens if max_tokens is not None else 2048
            }
        }
        if json_mode:
            body["generationConfig"]["responseMimeType"] = "application/json"

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        async with httpx.AsyncClient(timeout=55.0) as client:
            try:
                res = await client.post(url, json=body)
            except Exception as e:
                raise LLMError(f"Gemini request failed: {str(e)}")
            
            if res.status_code != 200:
                raise LLMError(
                    f"Gemini request failed ({res.status_code}): {res.text[:300]}",
                    status_code=res.status_code
                )
            
            try:
                data = res.json()
                text = ""
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text = "".join([p.get("text", "") for p in parts])
                
                if not text:
                    raise LLMError("Gemini returned an empty response")
                return text
            except Exception as e:
                if isinstance(e, LLMError):
                    raise e
                raise LLMError(f"Failed to parse Gemini response: {str(e)}")

class NvidiaProvider(LLMProvider):
    name = "nvidia"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = os.getenv("NVIDIA_MODEL", "minimaxai/minimax-m2.7")
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

    async def complete(
        self,
        system: str,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        api_messages = [{"role": "system", "content": system}]
        for m in messages:
            api_messages.append({"role": m["role"], "content": m["content"]})

        body = {
            "model": self.model,
            "messages": api_messages,
            "temperature": temperature if temperature is not None else 1.0,
            "top_p": 0.95,
            "max_tokens": max_tokens if max_tokens is not None else 8192,
            "stream": False
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        async with httpx.AsyncClient(timeout=55.0) as client:
            try:
                res = await client.post(f"{self.base_url}/chat/completions", json=body, headers=headers)
            except asyncio.TimeoutError:
                raise LLMError("NVIDIA NIM request timed out after 55 seconds. Try reducing maxTokens or simplifying the prompt.")
            except Exception as e:
                raise LLMError(f"NVIDIA NIM request failed: {str(e)}")

            if res.status_code != 200:
                raise LLMError(
                    f"NVIDIA NIM request failed ({res.status_code}): {res.text[:300]}",
                    status_code=res.status_code
                )

            try:
                data = res.json()
                choices = data.get("choices", [])
                text = choices[0].get("message", {}).get("content", "") if choices else ""
                if not text:
                    raise LLMError("NVIDIA NIM returned an empty response")
                return text
            except Exception as e:
                if isinstance(e, LLMError):
                    raise e
                raise LLMError(f"Failed to parse NVIDIA NIM response: {str(e)}")

class MistralProvider(LLMProvider):
    name = "mistral"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
        self.base_url = os.getenv("MISTRAL_BASE_URL", "https://api.mistral.ai/v1")

    async def complete(
        self,
        system: str,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        api_messages = [{"role": "system", "content": system}]
        for m in messages:
            api_messages.append({"role": m["role"], "content": m["content"]})

        body = {
            "model": self.model,
            "messages": api_messages,
            "temperature": temperature if temperature is not None else 0.7,
            "max_tokens": max_tokens if max_tokens is not None else 4096
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        async with httpx.AsyncClient(timeout=55.0) as client:
            try:
                res = await client.post(f"{self.base_url}/chat/completions", json=body, headers=headers)
            except asyncio.TimeoutError:
                raise LLMError("Mistral AI request timed out after 55 seconds. Try reducing maxTokens or simplifying the prompt.")
            except Exception as e:
                raise LLMError(f"Mistral AI request failed: {str(e)}")

            if res.status_code != 200:
                raise LLMError(
                    f"Mistral AI request failed ({res.status_code}): {res.text[:300]}",
                    status_code=res.status_code
                )

            try:
                data = res.json()
                choices = data.get("choices", [])
                text = choices[0].get("message", {}).get("content", "") if choices else ""
                if not text:
                    raise LLMError("Mistral AI returned an empty response")
                return text
            except Exception as e:
                if isinstance(e, LLMError):
                    raise e
                raise LLMError(f"Failed to parse Mistral AI response: {str(e)}")

class BedrockProvider(LLMProvider):
    name = "bedrock"

    def __init__(self):
        self.model = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
        self.region = os.getenv("AWS_REGION", "us-east-1")

    async def complete(
        self,
        system: str,
        messages: List[Dict[str, str]],
        json_mode: bool = False,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        try:
            import boto3
        except ImportError:
            raise LLMError("Bedrock provider selected but boto3 is not installed.", status_code=500)

        # Build payload matching Claude Messages API on Bedrock
        claude_messages = []
        for m in messages:
            claude_messages.append({
                "role": m["role"],
                "content": [{"type": "text", "text": m["content"]}]
            })

        sys_prompt = f"{system}\nRespond with valid JSON only." if json_mode else system

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens if max_tokens is not None else 2048,
            "temperature": temperature if temperature is not None else 0.6,
            "system": sys_prompt,
            "messages": claude_messages
        }

        try:
            loop = asyncio.get_running_loop()
            # Run blocking boto3 client in an executor
            def invoke():
                client = boto3.client("bedrock-runtime", region_name=self.region)
                return client.invoke_model(
                    modelId=self.model,
                    contentType="application/json",
                    accept="application/json",
                    body=json.dumps(body)
                )
            
            res = await loop.run_in_executor(None, invoke)
            res_body = json.loads(res.get("body").read().decode("utf-8"))
            
            text = ""
            content_blocks = res_body.get("content", [])
            for block in content_blocks:
                if block.get("type") == "text":
                    text += block.get("text", "")
            
            if not text:
                raise LLMError("Bedrock returned an empty response")
            return text
        except Exception as e:
            if isinstance(e, LLMError):
                raise e
            raise LLMError(f"Bedrock request failed: {str(e)}")

def get_provider() -> Optional[LLMProvider]:
    explicit = os.getenv("LLM_PROVIDER", "").lower()
    
    def try_gemini():
        key = os.getenv("GEMINI_API_KEY")
        return GeminiProvider(key) if key else None
        
    def try_nvidia():
        key = os.getenv("NVIDIA_API_KEY")
        return NvidiaProvider(key) if key else None
        
    def try_mistral():
        key = os.getenv("MISTRAL_API_KEY")
        return MistralProvider(key) if key else None
        
    def try_bedrock():
        return BedrockProvider()

    if explicit == "gemini":
        return try_gemini()
    elif explicit == "nvidia":
        return try_nvidia()
    elif explicit == "mistral":
        return try_mistral()
    elif explicit == "bedrock":
        return try_bedrock()
    elif explicit == "demo":
        return None

    # Auto-detect
    return try_gemini() or try_nvidia() or try_mistral() or None

def active_provider_name() -> str:
    p = get_provider()
    return p.name if p else "demo"

def extract_json(raw: str) -> Any:
    if not raw:
        raise ValueError("Empty model response")
    text = raw.strip()

    # Strip ```json ... ``` or ``` ... ``` fences.
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if fence and fence.group(1):
        text = fence.group(1).strip()

    # Fall back to the first balanced-looking object slice.
    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

    # Try to parse as-is first
    try:
        return json.loads(text)
    except json.JSONDecodeError as first_error:
        # Try to repair truncated JSON
        last_brace = text.rfind("}")
        if last_brace != -1:
            open_braces = 0
            close_braces = 0
            last_valid_pos = -1
            
            for i, char in enumerate(text):
                if char == "{":
                    open_braces += 1
                elif char == "}":
                    close_braces += 1
                    if open_braces == close_braces:
                        last_valid_pos = i
            
            if last_valid_pos != -1:
                repaired_text = text[:last_valid_pos + 1]
                try:
                    return json.loads(repaired_text)
                except json.JSONDecodeError:
                    pass
                    
        raise ValueError(f"JSON parse failed: {first_error.msg}. Text length: {len(text)}")
