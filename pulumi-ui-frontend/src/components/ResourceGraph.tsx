import React, { useMemo } from 'react';
import dagre from 'dagre';
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Resource } from '../types';

interface ResourceGraphProps {
    resources: Resource[];
}

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
        };
    });

    return { nodes: layoutedNodes, edges };
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ resources }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useMemo(() => {
        const newNodes: Node[] = resources.map((resource) => ({
            id: resource.urn,
            data: { label: `${resource.type}\n${resource.urn.split('::').pop()}` },
            position: { x: 0, y: 0 }, // Initial position, will be updated by dagre
        }));

        const newEdges: Edge[] = resources
            .filter((resource) => resource.parent)
            .map((resource) => ({
                id: `${resource.parent}-${resource.urn}`,
                source: resource.parent!,
                target: resource.urn,
                type: 'smoothstep',
            }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [resources, setNodes, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
};

export default ResourceGraph;