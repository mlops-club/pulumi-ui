import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    EdgeLabelRenderer,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Resource } from '../types';
import CustomNode from './CustomNode';
import { ToggleButton, ToggleButtonGroup, Box, Typography, Tooltip } from '@mui/material';
import { createGraph } from '../graph';

interface StackResourcesGraphViewProps {
    resources: Resource[] | undefined;
    onNodeClick: (resource: Resource) => void;
    colorMode: 'light' | 'dark';
    stackName: string;
}

type GraphAlgorithm = 'parent-child' | 'dependency';

const StackResourcesGraphView: React.FC<StackResourcesGraphViewProps> = ({ resources, onNodeClick, colorMode, stackName }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['stack']));
    const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('parent-child');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
    const { fitView } = useReactFlow();

    const toggleNodeExpansion = useCallback((nodeId: string) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    const onLayout = useCallback(() => {
        if (!resources) return;
        const { nodes: layoutedNodes, edges: layoutedEdges } = createGraph(resources, stackName, expandedNodes, algorithm, toggleNodeExpansion);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => {
            fitView();
        });
    }, [resources, stackName, expandedNodes, algorithm, setNodes, setEdges, fitView]);

    useEffect(() => {
        onLayout();
    }, [onLayout, expandedNodes, algorithm]);

    // Initialize all nodes as expanded in parent-child view
    useEffect(() => {
        if (resources && algorithm === 'parent-child') {
            setExpandedNodes(new Set(resources.map(r => r.urn)));
        }
    }, [resources, algorithm]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const isDarkMode = colorMode === 'dark';

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge.id);
    }, []);

    const getEdgeLabel = useCallback((edge: Edge) => {
        if (algorithm === 'dependency' && edge.data?.relationships) {
            return edge.data.relationships.length.toString();
        }
        return '';
    }, [algorithm]);

    if (!resources || resources.length === 0) {
        return <div>No resources to display</div>;
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    value={algorithm}
                    exclusive
                    onChange={(_, newAlgorithm) => newAlgorithm && setAlgorithm(newAlgorithm)}
                    aria-label="graph algorithm"
                >
                    <ToggleButton value="parent-child" aria-label="parent-child view">
                        <Typography>Parent-Child</Typography>
                    </ToggleButton>
                    <ToggleButton value="dependency" aria-label="dependency view">
                        <Typography>Dependency (Alpha)</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    attributionPosition="bottom-left"
                    onNodeClick={(event, node) => {
                        const resource = resources?.find(r => r.urn === node.id);
                        if (resource) {
                            onNodeClick(resource);
                        }
                    }}
                    onEdgeClick={onEdgeClick}
                    edgeLabels={getEdgeLabel}
                    proOptions={{ hideAttribution: true }}
                    className={isDarkMode ? 'react-flow__container-dark' : ''}
                >
                    <Background color={isDarkMode ? '#999' : '#aaa'} gap={16} />
                    <Controls />
                    <MiniMap />
                    <EdgeLabelRenderer>
                        {edges.map((edge) => (
                            <Tooltip
                                key={edge.id}
                                title={
                                    <div>
                                        {edge.data?.relationships.map((rel, index) => (
                                            <div key={index}>
                                                {`${edge.source.split('::').pop()}.${rel.input} depends on ${edge.target.split('::').pop()}.${rel.output} (${rel.value})`}
                                            </div>
                                        ))}
                                    </div>
                                }
                                placement="top"
                                open={selectedEdge === edge.id}
                                onClose={() => setSelectedEdge(null)}
                                PopperProps={{
                                    anchorEl: document.getElementById(edge.id),
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -10],
                                            },
                                        },
                                    ],
                                }}
                            >
                                <div
                                    id={edge.id}
                                    style={{
                                        position: 'absolute',
                                        transform: `translate(-50%, -50%) translate(${edge.sourceX}px,${edge.sourceY}px)`,
                                        fontSize: 12,
                                        pointerEvents: 'all',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedEdge(edge.id);
                                    }}
                                >
                                    {getEdgeLabel(edge)}
                                </div>
                            </Tooltip>
                        ))}
                    </EdgeLabelRenderer>
                </ReactFlow>
            </Box>
        </Box>
    );
};

const StackResourcesGraphViewWrapper: React.FC<StackResourcesGraphViewProps> = (props) => {
    return (
        <ReactFlowProvider>
            <StackResourcesGraphView {...props} />
        </ReactFlowProvider>
    );
};

export default StackResourcesGraphViewWrapper;