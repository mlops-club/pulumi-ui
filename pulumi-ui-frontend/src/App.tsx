import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Node, Edge, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Project, Stack, Resource } from './types';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStack = async (projectName: string, stackName: string) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/stacks/${stackName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stack');
      }
      const data = await response.json();
      setSelectedStack(data);
      createGraph(data.resources);
    } catch (error) {
      console.error('Error fetching stack:', error);
    }
  };

  const createGraph = useCallback((resources: Resource[]) => {
    const newNodes: Node[] = resources.map((resource, index) => ({
      id: resource.urn,
      data: { label: `${resource.type}\n${resource.id || ''}` },
      position: { x: index * 200, y: index * 100 },
    }));

    const newEdges: Edge[] = resources.flatMap((resource) => {
      if (resource.parent) {
        return [{
          id: `${resource.parent}-${resource.urn}`,
          source: resource.parent,
          target: resource.urn,
        }];
      }
      return [];
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return (
    <div className="App">
      <h1>Pulumi Projects</h1>
      <button onClick={fetchProjects}>Refresh Projects</button>
      {projects.map((project) => (
        <div key={project.name}>
          <h2>{project.name}</h2>
          <ul>
            {project.stacks.map((stack) => (
              <li key={stack.name} onClick={() => fetchStack(project.name, stack.name)}>
                {stack.name} (Last Updated: {new Date(stack.last_updated).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      ))}
      {selectedStack && (
        <div style={{ height: '600px', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}

export default App;
