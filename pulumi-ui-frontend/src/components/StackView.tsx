import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Tabs,
    Tab,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    CircularProgress,
    Button
} from '@mui/material';
import { Stack, Resource } from '../types';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeIcon from '@mui/icons-material/Home';
import ResourceGraph from './ResourceGraph';

type Order = 'asc' | 'desc';
type TabValue = 'overview' | 'readme' | 'resources';

const StackView: React.FC = () => {
    const { projectName, stackName, tab } = useParams<{ projectName: string; stackName: string; tab: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [stack, setStack] = useState<Stack | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<TabValue>('overview');
    const [resourceView, setResourceView] = useState<'list' | 'graph'>('list');
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Resource>('type');

    const fetchStack = useCallback(async () => {
        if (!projectName || !stackName) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/projects/${projectName}/stacks/${stackName}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Stack '${stackName}' not found in project '${projectName}'`);
                }
                throw new Error('Failed to fetch stack');
            }
            const data = await response.json();
            setStack(data);
        } catch (error) {
            console.error('Error fetching stack:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [projectName, stackName]);

    useEffect(() => {
        fetchStack();
    }, [fetchStack]);

    useEffect(() => {
        if (tab && ['overview', 'readme', 'resources'].includes(tab)) {
            setTabValue(tab as TabValue);
        } else {
            navigate(`/projects/${projectName}/stacks/${stackName}/overview`, { replace: true });
        }
    }, [tab, projectName, stackName, navigate]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: TabValue) => {
        navigate(`/projects/${projectName}/stacks/${stackName}/${newValue}`);
    }, [navigate, projectName, stackName]);

    const handleResourceViewChange = useCallback((
        event: React.MouseEvent<HTMLElement>,
        newView: 'list' | 'graph',
    ) => {
        if (newView !== null) {
            setResourceView(newView);
        }
    }, []);

    const handleRequestSort = useCallback((property: keyof Resource) => {
        setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
        setOrderBy(property);
    }, [orderBy]);

    const sortedResources = useMemo(() => {
        if (!stack) return [];
        const comparator = (a: Resource, b: Resource) => {
            if (b[orderBy] < a[orderBy]) {
                return order === 'asc' ? 1 : -1;
            }
            if (b[orderBy] > a[orderBy]) {
                return order === 'asc' ? -1 : 1;
            }
            return 0;
        };

        return [...stack.resources].sort(comparator);
    }, [stack, order, orderBy]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h4" gutterBottom>
                    404 - Stack Not Found
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Home
                </Button>
            </Box>
        );
    }

    if (!stack) {
        return <Typography variant="h4">Stack not found</Typography>;
    }

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Overview" value="overview" disableRipple />
                    <Tab label="Readme" value="readme" disableRipple />
                    <Tab label="Resources" value="resources" disableRipple />
                </Tabs>
            </Box>
            <Box sx={{ p: 3, height: 'calc(100% - 48px)' }}>
                {tabValue === 'overview' && (
                    <Box>
                        <h2>Overview</h2>
                        {/* Add overview content here */}
                    </Box>
                )}
                {tabValue === 'readme' && (
                    <Box>
                        <h2>Readme</h2>
                        {/* Add readme content here */}
                    </Box>
                )}
                {tabValue === 'resources' && (
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
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === 'type'}
                                                    direction={orderBy === 'type' ? order : 'asc'}
                                                    onClick={() => handleRequestSort('type')}
                                                >
                                                    Type
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel
                                                    active={orderBy === 'urn'}
                                                    direction={orderBy === 'urn' ? order : 'asc'}
                                                    onClick={() => handleRequestSort('urn')}
                                                >
                                                    Name
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedResources.map((resource) => (
                                            <TableRow key={resource.urn}>
                                                <TableCell>{resource.type}</TableCell>
                                                <TableCell>{resource.urn.split('::').pop()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ height: 'calc(100% - 40px)' }}>
                                <ResourceGraph resources={stack.resources} />
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StackView;