from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class StackInfo(BaseModel):
    name: str
    last_updated: datetime

class Project(BaseModel):
    name: str  # Changed from project_name to name
    stacks: List[StackInfo]

class Resource(BaseModel):
    urn: str
    type: str
    custom: bool
    id: Optional[str] = None
    parent: Optional[str] = None
    provider: Optional[str] = None
    inputs: Optional[Dict[str, Any]] = None
    outputs: Optional[Dict[str, Any]] = None
    created: Optional[datetime] = None
    modified: Optional[datetime] = None

class Stack(BaseModel):
    name: str
    resources: List[Resource]
    outputs: Dict[str, Any]