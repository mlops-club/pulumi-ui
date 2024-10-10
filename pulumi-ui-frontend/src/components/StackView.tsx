import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    Box,
    Tabs,
    Tab,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    CircularProgress,
    Button,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Stack, Resource } from '../types';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StackResourcesGraphViewTab from './StackResourcesGraphViewTab';
import StackResourcesListViewTab from './StackResourcesListViewTab';
import ResourceView from './ResourceView';
import StackOverviewTab from './StackOverviewTab';

type Order = 'asc' | 'desc';
type TabValue = 'overview' | 'readme' | 'resources';

const StackView: React.FC = () => {
    const { projectName, stackName, tab, resourceName } = useParams<{ projectName?: string; stackName?: string; tab?: string; resourceName?: string }>();

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
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [jsonDialogOpen, setJsonDialogOpen] = useState(false);

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
        if (resourceName && stack) {
            const resource = stack.resources.find(r => r.urn.split('::').pop() === resourceName || r.urn === resourceName);
            setSelectedResource(resource || null);
            setTabValue('resources');
        } else {
            setSelectedResource(null);
        }
    }, [resourceName, stack]);

    useEffect(() => {
        if (tab && ['overview', 'readme', 'resources'].includes(tab)) {
            setTabValue(tab as TabValue);
            if (tab === 'resources') {
                const graphView = searchParams.get('graph_view');
                setResourceView(graphView === 'true' ? 'graph' : 'list');
            }
        } else if (!resourceName) {
            navigate(`/projects/${projectName}/stacks/${stackName}/overview`, { replace: true });
        }
    }, [tab, projectName, stackName, navigate, searchParams, resourceName]);

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
            const aValue = a[orderBy];
            const bValue = b[orderBy];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return 0;
        };

        return [...stack.resources].sort(comparator);
    }, [stack, order, orderBy]);

    const renderReadme = () => {
        if (stack && stack.outputs && stack.outputs.readme) {
            return (
                <Box sx={{
                    p: 2,
                    height: 'calc(100% - 48px)', // Subtract the height of the tabs
                    overflowY: 'auto', // Enable vertical scrolling
                    overflowX: 'hidden', // Hide horizontal scrollbar
                    maxWidth: '100%', // Ensure content doesn't exceed container width
                }}>
                    <Box sx={{
                        maxWidth: '100%', // Limit content width
                        '& img': { maxWidth: '100%', height: 'auto' }, // Ensure images don't overflow
                        '& pre': {
                            overflowX: 'auto',
                            maxWidth: '100%',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }, // Handle code blocks
                        '& table': {
                            display: 'block',
                            overflowX: 'auto',
                            maxWidth: '100%'
                        }, // Handle tables
                    }}>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{stack.outputs.readme}</ReactMarkdown>
                    </Box>
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
                    p: 3,
                    overflowY: 'auto' // Enable vertical scrolling
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

    const renderResourcesTab = () => {
        if (resourceName && selectedResource) {
            return <ResourceView resource={selectedResource} stack={stack!} />;
        }

        if (resourceView === 'list') {
            return (
                <StackResourcesListViewTab
                    resources={sortedResources}
                    orderBy={orderBy}
                    order={order}
                    onRequestSort={handleRequestSort}
                    projectName={projectName}
                    stackName={stackName}
                />
            );
        } else {
            return (
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                    <StackResourcesGraphViewTab
                        resources={stack?.resources || []}
                        onNodeClick={(resource: Resource) => navigate(`/projects/${projectName}/stacks/${stackName}/resources/${encodeURIComponent(resource.urn.split('::').pop() || '')}`)}
                    />
                </Box>
            );
        }
    };

    const renderContent = () => {
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
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Overview" value="overview" disableRipple />
                        <Tab label="Readme" value="readme" disableRipple />
                        <Tab label="Resources" value="resources" disableRipple />
                    </Tabs>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {tabValue === 'overview' && <StackOverviewTab stack={stack} />}
                    {tabValue === 'readme' && renderReadme()}
                    {tabValue === 'resources' && (
                        <Box sx={{ height: '100%', overflowY: 'auto' }}>
                            {!resourceName && (
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
                            )}
                            {renderResourcesTab()}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    return renderContent();
};

export default StackView;