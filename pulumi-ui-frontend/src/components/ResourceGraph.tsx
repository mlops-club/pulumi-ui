import React, { useMemo } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Resource } from '../types';

interface ResourceGraphProps {
    resources: Resource[];
}

const ResourceGraph: React.FC<ResourceGraphProps> = ({ resources }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useMemo(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const nodeMap = new Map<string, Node>();

        resources.forEach((resource, index) => {
            const node: Node = {
                id: resource.urn,
                data: { label: `${resource.type}\n${resource.urn.split('::').pop()}` },
                position: { x: index * 200, y: index * 100 },
            };
            newNodes.push(node);
            nodeMap.set(resource.urn, node);

            if (resource.parent) {
                newEdges.push({
                    id: `${resource.parent}-${resource.urn}`,
                    source: resource.parent,
                    target: resource.urn,
                });
            }
        });

        // Adjust node positions based on parent-child relationships
        newNodes.forEach((node) => {
            const resource = resources.find((r) => r.urn === node.id);
            if (resource && resource.parent) {
                const parentNode = nodeMap.get(resource.parent);
                if (parentNode) {
                    node.position.x = parentNode.position.x + 200;
                    node.position.y = parentNode.position.y + 100;
                }
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [resources, setNodes, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
};

export default ResourceGraph;