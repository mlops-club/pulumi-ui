import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Node, Edge, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Project, Stack, Resource } from './types';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Tooltip
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LayersIcon from '@mui/icons-material/Layers';

const drawerWidth = 240;

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Set all projects to expanded by default
    setExpandedProjects(new Set(projects.map(p => p.name)));
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStack = async (projectName: string, stackName: string) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/stacks/${stackName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stack');
      }
      const data = await response.json();
      setSelectedStack(data);
      createGraph(data.resources);
    } catch (error) {
      console.error('Error fetching stack:', error);
    }
  };

  const createGraph = useCallback((resources: Resource[]) => {
    const newNodes: Node[] = resources.map((resource, index) => ({
      id: resource.urn,
      data: { label: `${resource.type}\n${resource.id || ''}` },
      position: { x: index * 200, y: index * 100 },
    }));

    const newEdges: Edge[] = resources.flatMap((resource) => {
      if (resource.parent) {
        return [{
          id: `${resource.parent}-${resource.urn}`,
          source: resource.parent,
          target: resource.urn,
        }];
      }
      return [];
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleProjectExpansion = (projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : 56,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : 56,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <List>
          <ListItem disablePadding sx={{ justifyContent: drawerOpen ? 'flex-end' : 'center' }}>
            <IconButton onClick={toggleDrawer}>
              {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </ListItem>
          {drawerOpen && (
            <>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary="Stacks" />
                </ListItemButton>
              </ListItem>
              {projects.map((project) => (
                <React.Fragment key={project.name}>
                  <ListItemButton onClick={() => toggleProjectExpansion(project.name)}>
                    <ListItemText primary={project.name} />
                    {expandedProjects.has(project.name) ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={expandedProjects.has(project.name)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {project.stacks.map((stack) => (
                        <ListItemButton
                          key={stack.name}
                          sx={{ pl: 4 }}
                          onClick={() => fetchStack(project.name, stack.name)}
                        >
                          <ListItemText primary={stack.name} secondary={new Date(stack.last_updated).toLocaleString()} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
            </>
          )}
          {!drawerOpen && (
            <ListItem disablePadding>
              <Tooltip title="Stacks" placement="right" arrow>
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                    <LayersIcon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {selectedStack && (
          <div style={{ height: 'calc(100vh - 24px)', width: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        )}
      </Box>
    </Box>
  );
}

export default App;