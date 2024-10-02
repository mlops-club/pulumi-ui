from fastapi import APIRouter

from pulumi_ui.schemas import StackInfo, Stack, Resource
from typing import List
from datetime import datetime
import json
from pathlib import Path

THIS_DIR = Path(__file__).parent

ROUTER = APIRouter()

@ROUTER.get("/api/stacks", response_model=List[StackInfo])
async def get_stacks():
    # For now, we'll return a hardcoded list of stacks
    return [
        StackInfo(name="hello", created_at=datetime.now()),
        StackInfo(name="dev", created_at=datetime.now()),
    ]

@ROUTER.get("/api/stacks/{stack_name}", response_model=Stack)
async def get_stack(stack_name: str):
    # For now, we'll always return the hello.json stack
    STACK_PATH = THIS_DIR / "hello.json"
    with open(STACK_PATH, 'r') as f:
        data = json.load(f)
    
    resources = [Resource(**r) for r in data['checkpoint']['latest']['resources']]
    outputs = data['checkpoint']['latest']['resources'][0]['outputs']
    
    return Stack(name=stack_name, resources=resources, outputs=outputs)