import React, { useState } from 'react';
import { Box, Tabs, Tab, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Stack } from '../types';
import { ReactFlow, Node, Edge, Controls, Background } from '@xyflow/react';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface StackViewProps {
    stack: Stack;
    nodes: Node[];
    edges: Edge[];
}

const StackView: React.FC<StackViewProps> = ({ stack, nodes, edges }) => {
    const [tabValue, setTabValue] = useState(0);
    const [resourceView, setResourceView] = useState<'list' | 'graph'>('list');

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleResourceViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: 'list' | 'graph',
    ) => {
        if (newView !== null) {
            setResourceView(newView);
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Overview" disableRipple />
                    <Tab label="Readme" disableRipple />
                    <Tab label="Resources" disableRipple />
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
                        <Box sx={{ mb: 2 }}>
                            <ToggleButtonGroup
                                value={resourceView}
                                exclusive
                                onChange={handleResourceViewChange}
                                aria-label="resource view"
                            >
                                <ToggleButton value="list" aria-label="list view" disableRipple>
                                    <ListIcon sx={{ mr: 1 }} />
                                    <Typography>List View</Typography>
                                </ToggleButton>
                                <ToggleButton value="graph" aria-label="graph view" disableRipple>
                                    <AccountTreeIcon sx={{ mr: 1 }} />
                                    <Typography>Graph View</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {resourceView === 'list' ? (
                            <Box>
                                {/* Add list view content here */}
                                <Typography>List View Content</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ height: 'calc(100% - 40px)' }}>
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
                )}
            </Box>
        </Box>
    );
};

export default StackView;