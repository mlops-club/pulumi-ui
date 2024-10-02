from fastapi import APIRouter, Request
from pulumi_ui.schemas import Stack, Project
from typing import List
from datetime import datetime
import json
from pathlib import Path
from pulumi_ui.settings import Settings
from pulumi_ui.pulumi_state import list_projects, get_stack

THIS_DIR = Path(__file__).parent

ROUTER = APIRouter()

@ROUTER.get("/api/projects", response_model=List[Project])
async def get_projects(request: Request):
    settings: Settings = request.app.state.settings
    return list_projects(settings.pulumi_cloud_url)

@ROUTER.get("/api/projects/{project_name}/stacks/{stack_name}", response_model=Stack)
async def get_stack_details(project_name: str, stack_name: str, request: Request):
    settings: Settings = request.app.state.settings
    return get_stack(settings.pulumi_cloud_url, project_name, stack_name)