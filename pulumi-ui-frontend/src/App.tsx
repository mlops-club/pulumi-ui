import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import FolderIcon from '@mui/icons-material/Folder';

const mainDrawerWidthClosed = 56; // Width when closed
const mainDrawerWidthOpen = 180; // Width when open
const projectsDrawerWidth = 240;

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mainDrawerOpen, setMainDrawerOpen] = useState(false);
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const projectsDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectsDrawerOpen) {
      fetchProjects();
    }
  }, [projectsDrawerOpen]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      // Expand all projects by default
      setExpandedProjects(new Set(data.map((p: Project) => p.name)));
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

  const toggleMainDrawer = () => {
    setMainDrawerOpen(!mainDrawerOpen);
  };

  const toggleProjectsDrawer = () => {
    setProjectsDrawerOpen(!projectsDrawerOpen);
    if (!projectsDrawerOpen) {
      setTimeout(() => {
        projectsDrawerRef.current?.focus();
      }, 100);
    }
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        anchor="left"
        open={mainDrawerOpen}
        sx={{
          width: mainDrawerOpen ? mainDrawerWidthOpen : mainDrawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: mainDrawerOpen ? mainDrawerWidthOpen : mainDrawerWidthClosed,
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
          <ListItem disablePadding sx={{ 
            justifyContent: mainDrawerOpen ? 'flex-end' : 'center',
            paddingRight: mainDrawerOpen ? 1 : 0,
          }}>
            <IconButton onClick={toggleMainDrawer}>
              {mainDrawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip title="Stacks" placement="right" arrow>
              <ListItemButton 
                onClick={toggleProjectsDrawer}
                selected={projectsDrawerOpen}
                sx={{
                  justifyContent: 'center',
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: mainDrawerOpen ? 3 : 'auto', 
                  justifyContent: 'center',
                }}>
                  <LayersIcon />
                </ListItemIcon>
                {mainDrawerOpen && <ListItemText primary="Stacks" sx={{ opacity: 1 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>
      <Drawer
        variant="persistent"
        anchor="left"
        open={projectsDrawerOpen}
        sx={{
          width: projectsDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: projectsDrawerWidth,
            boxSizing: 'border-box',
            left: mainDrawerOpen ? mainDrawerWidthOpen : mainDrawerWidthClosed,
          },
        }}
      >
        <List ref={projectsDrawerRef} tabIndex={-1}>
          {projects.map((project) => (
            <React.Fragment key={project.name}>
              <ListItemButton onClick={() => toggleProjectExpansion(project.name)}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText primary={project.name} />
                {expandedProjects.has(project.name) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={expandedProjects.has(project.name)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {project.stacks.map((stack) => (
                    <ListItemButton
                      key={stack.name}
                      sx={{ 
                        pl: 4, 
                        py: 0.5,
                        '&.Mui-focused': {
                          backgroundColor: 'action.selected',
                        },
                      }}
                      onClick={() => fetchStack(project.name, stack.name)}
                      selected={selectedStack?.name === stack.name}
                    >
                      <ListItemText 
                        primary={stack.name} 
                        secondary={new Date(stack.last_updated).toLocaleString()} 
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        {selectedStack && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </Box>
    </Box>
  );
}

export default App;