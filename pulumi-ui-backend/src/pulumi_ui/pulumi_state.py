from cloudpathlib import CloudPath
from collections import defaultdict
from pulumi_ui.schemas import StackInfo, Project, Stack, Resource
from typing import List
import json

def list_projects(state_uri: str) -> List[Project]:
    stacks_dir = CloudPath(state_uri) / ".pulumi/stacks/"
    stack_paths = list(stacks_dir.rglob("*.json"))

    projects = defaultdict(list)

    for stack_path in stack_paths:
        project_name = stack_path.parent.name
        stack_name = stack_path.name.rstrip(".json")
        last_updated = stack_path.stat().st_mtime
        projects[project_name].append(StackInfo(name=stack_name, last_updated=last_updated))

    return [Project(name=name, stacks=stacks) for name, stacks in projects.items()]

def get_stack(state_uri: str, project_name: str, stack_name: str) -> Stack:
    stack_path = CloudPath(state_uri) / f".pulumi/stacks/{project_name}/{stack_name}.json"
    stack_json = json.loads(stack_path.read_text())
    
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