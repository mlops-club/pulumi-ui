export interface StackInfo {
  name: string;
  last_updated: string;
}

export interface Project {
  name: string;  // Changed from project_name to name
  stacks: StackInfo[];
}

export interface Resource {
  urn: string;
  type: string;
  custom: boolean;
  id?: string;
  parent?: string;
  provider?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  created?: string;
  modified?: string;
}

export interface Stack {
  name: string;
  resources: Resource[];
  outputs: Record<string, any>;
}