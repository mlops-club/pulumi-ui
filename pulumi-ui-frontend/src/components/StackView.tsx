import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Stack } from '../types';
import { ReactFlow, Node, Edge, Controls, Background } from '@xyflow/react';

interface StackViewProps {
    stack: Stack;
    nodes: Node[];
    edges: Edge[];
}

const StackView: React.FC<StackViewProps> = ({ stack, nodes, edges }) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Overview" />
                    <Tab label="Readme" />
                    <Tab label="Resources" />
                </Tabs>
            </Box>
            <Box sx={{ p: 3, height: 'calc(100% - 48px)' }}>
                {tabValue === 0 && (
                    <Box>
                        <h2>Overview</h2>
                        {/* Add overview content here */}
                    </Box>
                )}
                {tabValue === 1 && (
                    <Box>
                        <h2>Readme</h2>
                        {/* Add readme content here */}
                    </Box>
                )}
                {tabValue === 2 && (
                    <Box sx={{ height: '100%' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            fitView
                        >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StackView;