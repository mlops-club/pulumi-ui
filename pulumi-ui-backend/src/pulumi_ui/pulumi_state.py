from cloudpathlib import CloudPath
from pathlib import Path
from collections import defaultdict
from pulumi_ui.schemas import StackInfo, Project, Stack, Resource
from typing import List
import json
import os

def get_path(uri: str) -> Path | CloudPath:
    if uri.startswith(('s3://', 'az://', 'gs://')):
        return CloudPath(uri)
    
    uri = uri.replace("file://", "")
    return Path(uri)

def list_projects(state_uri: str) -> List[Project]:
    base_path: Path | CloudPath = get_path(state_uri)
    stacks_dir = base_path / ".pulumi/stacks/"

    if isinstance(base_path, CloudPath):
        stack_paths = list(stacks_dir.rglob("*.json"))
    else:
        stack_paths = list(stacks_dir.glob("**/*.json"))

    projects = defaultdict(list)

    for stack_path in stack_paths:
        project_name = stack_path.parent.name
        stack_name = stack_path.name.replace(".json", "")
        last_updated = stack_path.stat().st_mtime
        projects[project_name].append(StackInfo(name=stack_name, last_updated=last_updated))

    return [Project(name=name, stacks=stacks) for name, stacks in projects.items()]

def get_stack(state_uri: str, project_name: str, stack_name: str) -> Stack:
    base_path: Path | CloudPath = get_path(state_uri)
    stack_path = base_path / f".pulumi/stacks/{project_name}/{stack_name}.json"
    
    if isinstance(base_path, CloudPath):
        stack_json = json.loads(stack_path.read_text())
    else:
        with open(stack_path, 'r') as f:
            stack_json = json.load(f)
    
    resources = [Resource(**r) for r in stack_json['checkpoint']['latest']['resources']]
    
    outputs = {}
    for resource in resources:
        if resource.type == "pulumi:pulumi:Stack":
            outputs = resource.outputs or {}
            break
    
    return Stack(
        name=stack_name,
        resources=resources,
        outputs=outputs
    )