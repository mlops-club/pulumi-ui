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
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Stack, Resource } from '../types';
import ListIcon from '@mui/icons-material/List';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StackResourcesGraphViewTab from './StackResourcesGraphViewTab';
import StackResourcesListViewTab from './StackResourcesListViewTab';
import ResourceView from './ResourceView';
import StackOverviewTab from './StackOverviewTab';

type Order = 'asc' | 'desc';
type TabValue = 'overview' | 'readme' | 'resources';

interface StackViewProps {
    colorMode: 'light' | 'dark';
}

const StackView: React.FC<StackViewProps> = ({ colorMode }) => {
    const { projectName, stackName, resourceName } = useParams<{ projectName?: string; stackName?: string; resourceName?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [stack, setStack] = useState<Stack | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<TabValue>('overview');
    const [resourceView, setResourceView] = useState<'list' | 'graph'>('list');
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Resource>('type');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

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
            const resource = stack.resources.find(r => r.urn.split('::').pop() === resourceName);
            setSelectedResource(resource || null);
            setTabValue('resources');
        } else {
            setSelectedResource(null);
            const tab = location.pathname.split('/').pop() as TabValue;
            if (['overview', 'readme', 'resources'].includes(tab)) {
                setTabValue(tab);
            }
        }
        const graphView = searchParams.get('view');
        setResourceView(graphView === 'graph' ? 'graph' : 'list');
    }, [location, searchParams, resourceName, stack]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
        navigate(`/projects/${projectName}/stacks/${stackName}/${newValue}`);
    };

    const handleResourceViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: 'list' | 'graph',
    ) => {
        if (newView !== null) {
            setResourceView(newView);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('view', newView);
            setSearchParams(newSearchParams);
        }
    };

    const handleBackToResourcesView = () => {
        setSelectedResource(null);
        navigate(`/projects/${projectName}/stacks/${stackName}/resources?view=${resourceView}`);
    };

    const handleRequestSort = (property: keyof Resource) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrder(newOrder);
        setOrderBy(property);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('order', newOrder);
        newSearchParams.set('orderBy', property);
        setSearchParams(newSearchParams);
    };

    const sortedResources = useMemo(() => {
        if (!stack) return [];
        return [...stack.resources].sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return 0;
        });
    }, [stack, order, orderBy]);

    const handleResourceClick = (resource: Resource) => {
        setSelectedResource(resource);
        navigate(`/projects/${projectName}/stacks/${stackName}/resources/${encodeURIComponent(resource.urn.split('::').pop() || '')}`);
    };

    const renderReadme = () => {
        return (
            <Box sx={{
                height: 'calc(100% - 48px)', // Subtract the height of the tabs
                overflowY: 'auto',
                p: 2,
            }}>
                {stack && stack.outputs && stack.outputs.readme ? (
                    <Box sx={{
                        width: '100%',
                        maxWidth: '100%',
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& pre': {
                            overflowX: 'auto',
                            maxWidth: '100%',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        },
                        '& table': {
                            display: 'block',
                            overflowX: 'auto',
                            maxWidth: '100%'
                        },
                    }}>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{stack.outputs.readme}</ReactMarkdown>
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        p: 3,
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
                )}
            </Box>
        );
    };

    const renderResourcesTab = () => {
        if (selectedResource) {
            return (
                <Box sx={{ height: 'calc(100% - 48px)', overflowY: 'auto' }}>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleBackToResourcesView}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <ArrowBackIcon sx={{ mr: 1 }} />
                            Back to {resourceView === 'list' ? 'list' : 'graph'} view
                        </Link>
                    </Box>
                    <ResourceView resource={selectedResource} stack={stack!} />
                </Box>
            );
        }

        return (
            <Box sx={{ height: 'calc(100% - 48px)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                        value={resourceView}
                        exclusive
                        onChange={handleResourceViewChange}
                        aria-label="resource view"
                    >
                        <ToggleButton value="list" aria-label="list view">
                            <ListIcon sx={{ mr: 1 }} />
                            <Typography>List View</Typography>
                        </ToggleButton>
                        <ToggleButton value="graph" aria-label="graph view">
                            <AccountTreeIcon sx={{ mr: 1 }} />
                            <Typography>Graph View</Typography>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {resourceView === 'list' ? (
                        <StackResourcesListViewTab
                            resources={sortedResources}
                            orderBy={orderBy}
                            order={order}
                            onRequestSort={handleRequestSort}
                            projectName={projectName}
                            stackName={stackName}
                            onResourceClick={handleResourceClick}
                        />
                    ) : (
                        <StackResourcesGraphViewTab
                            resources={stack?.resources || []}
                            onNodeClick={handleResourceClick}
                            colorMode={colorMode}
                        />
                    )}
                </Box>
            </Box>
        );
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
                    {tabValue === 'resources' && renderResourcesTab()}
                </Box>
            </Box>
        );
    };

    return renderContent();
};

export default StackView;