export interface StackInfo {
  name: string;
  last_updated: string;
}

export interface Project {
  name: string;
  stacks: StackInfo[];
}

export interface Resource {
  urn: string;
  type: string;
  outputs?: Record<string, any>;
  children?: Resource[];
  parent?: string;  // Add this line
  // ... other resource properties
}

export interface Stack {
  name: string;
  resources: Resource[];
  outputs: Record<string, any>;
  version?: string;
  config?: Record<string, string>; // Add this line for configuration
}
