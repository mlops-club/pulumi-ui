import React, { useMemo } from 'react';
import dagre from 'dagre';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Resource } from '../types';
import CustomNode from './CustomNode';

interface StackResourcesGraphViewProps {
    resources: Resource[];
    onNodeClick: (resource: Resource) => void;
    colorMode: 'light' | 'dark';
}

const nodeWidth = 220;
const nodeHeight = 40;

const StackResourcesGraphView: React.FC<StackResourcesGraphViewProps> = ({ resources, onNodeClick, colorMode }) => {
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = resources.map((resource) => ({
            id: resource.urn,
            type: 'custom',
            data: {
                name: resource.urn.split('::').pop() || '',
                type: resource.type,
                hasChildren: resources.some((r) => r.parent === resource.urn),
                isExpanded: true,
                onToggle: () => { }, // Implement this if needed
                parent: resource.parent,
            },
            position: { x: 0, y: 0 },
        }));

        const edges: Edge[] = resources
            .filter((resource) => resource.parent)
            .map((resource) => ({
                id: `${resource.parent}-${resource.urn}`,
                source: resource.parent!,
                target: resource.urn,
                type: 'smoothstep',
            }));

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'LR', ranksep: 50, nodesep: 10 });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        nodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
            node.targetPosition = Position.Left;
            node.sourcePosition = Position.Right;
        });

        return { nodes, edges };
    }, [resources]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const isDarkMode = colorMode === 'dark';

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            attributionPosition="bottom-left"
            onNodeClick={(event, node) => {
                const resource = resources.find(r => r.urn === node.id);
                if (resource) {
                    onNodeClick(resource);
                }
            }}
            proOptions={{ hideAttribution: true }}
            className={isDarkMode ? 'react-flow__container-dark' : ''}
        >
            <Background color={isDarkMode ? '#999' : '#aaa'} gap={16} />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
};

export default StackResourcesGraphView;
