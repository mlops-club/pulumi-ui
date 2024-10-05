import React, { useMemo, useCallback, useEffect, useState } from 'react';
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
import CustomNode from './CustomNode';

interface ResourceGraphProps {
    resources: Resource[];
}

const nodeWidth = 200;
const nodeHeight = 50;

interface CustomNodeData {
    label: string;
    hasChildren: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    parent?: string;
    [key: string]: unknown;
}

type CustomNode = Node<CustomNodeData>;

const ResourceGraph: React.FC<ResourceGraphProps> = ({ resources }) => {
    const [allNodes, setAllNodes] = useState<CustomNode[]>([]);
    const [allEdges, setAllEdges] = useState<Edge[]>([]);
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const getLayoutedElements = useCallback((nodes: CustomNode[], edges: Edge[], direction = 'LR') => {
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
    }, []);

    const toggleNodeExpansion = useCallback((nodeId: string) => {
        setAllNodes((prevNodes) => {
            const updatedNodes = prevNodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, isExpanded: !node.data.isExpanded },
                    };
                }
                return node;
            });
            return updatedNodes;
        });
    }, []);

    const getVisibleNodes = useCallback((nodes: CustomNode[]): CustomNode[] => {
        const visibleNodes: CustomNode[] = [];
        const visited = new Set<string>();

        const dfs = (node: CustomNode) => {
            if (visited.has(node.id)) return;
            visited.add(node.id);
            visibleNodes.push(node);

            if (node.data.isExpanded) {
                nodes.forEach((childNode) => {
                    if (childNode.data.parent === node.id) {
                        dfs(childNode);
                    }
                });
            }
        };

        nodes.forEach((node) => {
            if (!node.data.parent) {
                dfs(node);
            }
        });

        return visibleNodes;
    }, []);

    const updateVisibleElements = useCallback(() => {
        try {
            const visibleNodes = getVisibleNodes(allNodes);
            const visibleEdges = allEdges.filter(
                (edge) => visibleNodes.some((node) => node.id === edge.source) &&
                    visibleNodes.some((node) => node.id === edge.target)
            );

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(visibleNodes, visibleEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } catch (error) {
            console.error('Error updating visible elements:', error);
        }
    }, [allNodes, allEdges, getVisibleNodes, getLayoutedElements, setNodes, setEdges]);

    useEffect(() => {
        const newNodes: CustomNode[] = resources.map((resource) => ({
            id: resource.urn,
            type: 'custom',
            data: {
                label: `${resource.type}\n${resource.urn.split('::').pop()}`,
                hasChildren: resources.some((r) => r.parent === resource.urn),
                isExpanded: true,
                onToggle: () => toggleNodeExpansion(resource.urn),
                parent: resource.parent,
            },
            position: { x: 0, y: 0 },
        }));

        const newEdges: Edge[] = resources
            .filter((resource) => resource.parent)
            .map((resource) => ({
                id: `${resource.parent}-${resource.urn}`,
                source: resource.parent!,
                target: resource.urn,
                type: 'smoothstep',
            }));

        setAllNodes(newNodes);
        setAllEdges(newEdges);
    }, [resources, toggleNodeExpansion]);

    useEffect(() => {
        updateVisibleElements();
    }, [allNodes, allEdges, updateVisibleElements]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    if (nodes.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
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