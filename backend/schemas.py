from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator
import re

class Stage(str, Enum):
    HIGH_SCHOOL = "high_school"
    COLLEGE = "college"
    NEW_GRAD = "new_grad"
    CAREER_SWITCHER = "career_switcher"
    SELF_TAUGHT = "self_taught"

class Budget(str, Enum):
    FREE = "free"
    LOW = "low"
    FLEXIBLE = "flexible"

class UserProfile(BaseModel):
    goal: str = Field(..., min_length=2, max_length=120)
    stage: Stage
    knownSkills: List[str] = Field(default_factory=list)
    hoursPerWeek: int = Field(..., ge=1, le=80)
    budget: Budget
    timelineMonths: int = Field(..., ge=1, le=60)

    @field_validator("knownSkills")
    @classmethod
    def validate_known_skills(cls, v):
        # Limit skills to 40 items and max 60 chars per item
        trimmed = [s[:60] for s in v[:40]]
        return trimmed

class Resource(BaseModel):
    name: str = Field(..., max_length=120)
    url: Optional[str] = Field(default="", max_length=300)
    cost: str = Field(default="free")

    @field_validator("cost", mode="before")
    @classmethod
    def transform_cost(cls, v):
        if not isinstance(v, str):
            return "free"
        if re.search(r"paid|\$|cost|subscri|premium", v, re.IGNORECASE):
            return "paid"
        return "free"

class RoadmapNode(BaseModel):
    id: str = Field(..., min_length=1, max_length=40)
    title: str = Field(..., min_length=2, max_length=120)
    skills: List[str] = Field(default_factory=list)
    estimatedWeeks: float = Field(..., ge=0, le=260)
    why: str = Field(default="", max_length=400)
    phase: Optional[str] = Field(default="", max_length=60)
    resources: List[Resource] = Field(default_factory=list)

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, v):
        return [s[:60] for s in v[:12]]

    @field_validator("resources")
    @classmethod
    def validate_resources(cls, v):
        return v[:5]

class RoadmapEdge(BaseModel):
    # Use alias 'from' for JSON serialization/deserialization as 'from' is a Python reserved keyword
    from_node: str = Field(..., alias="from")
    to: str = Field(...)
    condition: Optional[str] = Field(default="", max_length=120)

    class Config:
        populate_by_name = True

class RoadmapGraph(BaseModel):
    title: Optional[str] = Field(default="", max_length=120)
    summary: Optional[str] = Field(default="", max_length=600)
    nodes: List[RoadmapNode] = Field(..., min_length=1)
    edges: List[RoadmapEdge] = Field(default_factory=list)

    @field_validator("nodes")
    @classmethod
    def validate_nodes(cls, v):
        return v[:40]

    @field_validator("edges")
    @classmethod
    def validate_edges(cls, v):
        return v[:80]

class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(BaseModel):
    role: ChatRole
    content: str
