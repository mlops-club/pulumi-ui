import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Project, Stack, Resource } from './types';
import NavBar from './components/NavBar';
import StackExplorerBar from './components/StackExplorerBar';
import StackView from './components/StackView';

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
      <NavBar
        mainDrawerOpen={mainDrawerOpen}
        toggleMainDrawer={toggleMainDrawer}
        toggleProjectsDrawer={toggleProjectsDrawer}
        projectsDrawerOpen={projectsDrawerOpen}
      />
      <StackExplorerBar
        projects={projects}
        selectedStack={selectedStack}
        projectsDrawerOpen={projectsDrawerOpen}
        mainDrawerOpen={mainDrawerOpen}
        expandedProjects={expandedProjects}
        toggleProjectExpansion={toggleProjectExpansion}
        fetchStack={fetchStack}
      />
      <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        {selectedStack && (
          <StackView
            stack={selectedStack}
            nodes={nodes}
            edges={edges}
          />
        )}
      </Box>
    </Box>
  );
}

export default App;