from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StackInfo(BaseModel):
    name: str
    created_at: datetime

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

@app.get("/api/stacks", response_model=List[StackInfo])
async def get_stacks():
    # For now, we'll return a hardcoded list of stacks
    return [
        StackInfo(name="hello", created_at=datetime.now()),
        StackInfo(name="dev", created_at=datetime.now()),
    ]

@app.get("/api/stacks/{stack_name}", response_model=Stack)
async def get_stack(stack_name: str):
    # For now, we'll always return the hello.json stack
    stack_path = os.path.join(os.path.dirname(__file__), "../../../pulumi-playground/.pulumi-state/.pulumi/stacks/pulumi-ui-s3/hello.json")
    with open(stack_path, 'r') as f:
        data = json.load(f)
    
    resources = [Resource(**r) for r in data['checkpoint']['latest']['resources']]
    outputs = data['checkpoint']['latest']['resources'][0]['outputs']
    
    return Stack(name=stack_name, resources=resources, outputs=outputs)

