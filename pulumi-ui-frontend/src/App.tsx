import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Node, Edge, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StackInfo, Stack, Resource } from './types';

function App() {
  const [stacks, setStacks] = useState<StackInfo[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    fetchStacks();
  }, []);

  const fetchStacks = async () => {
    const response = await fetch('http://localhost:8000/api/stacks');
    const data = await response.json();
    setStacks(data);
  };

  const fetchStack = async (stackName: string) => {
    const response = await fetch(`http://localhost:8000/api/stacks/${stackName}`);
    const data = await response.json();
    setSelectedStack(data);
    createGraph(data.resources);
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
      <h1>Pulumi Stacks</h1>
      <button onClick={fetchStacks}>Refresh Stacks</button>
      <ul>
        {stacks.map((stack) => (
          <li key={stack.name} onClick={() => fetchStack(stack.name)}>
            {stack.name} (Created: {new Date(stack.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
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
