import React, { useState, useMemo, useEffect, useCallback, ErrorInfo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    Button,
    Link
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Stack, Resource } from '../types';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ResourceGraph from './ResourceGraph';

type Order = 'asc' | 'desc';
type TabValue = 'overview' | 'readme' | 'resources';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong with the graph view.</h1>;
        }

        return this.props.children;
    }
}

const StackView: React.FC = () => {
    const { projectName, stackName, tab } = useParams<{ projectName: string; stackName: string; tab: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
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
            if (tab === 'resources') {
                const graphView = searchParams.get('graph_view');
                setResourceView(graphView === 'true' ? 'graph' : 'list');
            }
        } else {
            navigate(`/projects/${projectName}/stacks/${stackName}/overview`, { replace: true });
        }
    }, [tab, projectName, stackName, navigate, searchParams]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: TabValue) => {
        const graphView = searchParams.get('graph_view');
        const newPath = `/projects/${projectName}/stacks/${stackName}/${newValue}`;
        if (newValue === 'resources' && graphView === 'true') {
            navigate(`${newPath}?graph_view=true`);
        } else {
            navigate(newPath);
        }
    }, [navigate, projectName, stackName, searchParams]);

    const handleResourceViewChange = useCallback((
        event: React.MouseEvent<HTMLElement>,
        newView: 'list' | 'graph',
    ) => {
        if (newView !== null) {
            setResourceView(newView);
            const newSearchParams = new URLSearchParams(searchParams);
            if (newView === 'graph') {
                newSearchParams.set('graph_view', 'true');
            } else {
                newSearchParams.delete('graph_view');
            }
            navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
        }
    }, [navigate, location.pathname, searchParams]);

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

    const renderReadme = () => {
        if (stack && stack.outputs && stack.outputs.readme) {
            return (
                <Box sx={{ p: 2 }}>
                    <ReactMarkdown>{stack.outputs.readme}</ReactMarkdown>
                </Box>
            );
        } else {
            return (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    p: 3
                }}>
                    <Typography variant="h6" gutterBottom>
                        <Link
                            href="https://www.pulumi.com/docs/pulumi-cloud/projects-and-stacks/#stack-readme"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                            Stack README's
                            <OpenInNewIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                        </Link>{' '}
                        are documentation for your Stack. README templates can reference Stack outputs and resource properties.
                    </Typography>
                    <DescriptionIcon sx={{ fontSize: 60, my: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        No README
                    </Typography>
                    <Typography>
                        There is no Stack README. To create one, add an output resource to your Stack called 'readme'.
                    </Typography>
                </Box>
            );
        }
    };

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
                {tabValue === 'readme' && renderReadme()}
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
                            <ErrorBoundary>
                                <Box sx={{ height: 'calc(100% - 40px)' }}>
                                    <ResourceGraph resources={stack.resources} />
                                </Box>
                            </ErrorBoundary>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StackView;