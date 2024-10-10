import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import NavBar from './components/NavBar';
import StackExplorerBar from './components/StackExplorerBar';
import StackView from './components/StackView';
import WelcomePage from './components/WelcomePage';
import { Project, Stack } from './types';

const App: React.FC = () => {
  const [mainDrawerOpen, setMainDrawerOpen] = useState(false);
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleMainDrawer = useCallback(() => setMainDrawerOpen(prev => !prev), []);
  const toggleProjectsDrawer = useCallback(() => setProjectsDrawerOpen(prev => !prev), []);

  const toggleProjectExpansion = useCallback((projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  }, []);

  const fetchStack = useCallback(async (projectName: string, stackName: string) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/stacks/${stackName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stack');
      }
      const data = await response.json();
      setSelectedStack(data);
    } catch (error) {
      console.error('Error fetching stack:', error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Router>
      <AppContent
        mainDrawerOpen={mainDrawerOpen}
        toggleMainDrawer={toggleMainDrawer}
        projectsDrawerOpen={projectsDrawerOpen}
        toggleProjectsDrawer={toggleProjectsDrawer}
        projects={projects}
        selectedStack={selectedStack}
        expandedProjects={expandedProjects}
        toggleProjectExpansion={toggleProjectExpansion}
        fetchStack={fetchStack}
        setProjectsDrawerOpen={setProjectsDrawerOpen}
        setExpandedProjects={setExpandedProjects}
      />
    </Router>
  );
}

function AppContent({
  mainDrawerOpen,
  toggleMainDrawer,
  projectsDrawerOpen,
  toggleProjectsDrawer,
  projects,
  selectedStack,
  expandedProjects,
  toggleProjectExpansion,
  fetchStack,
  setProjectsDrawerOpen,
  setExpandedProjects
}: {
  mainDrawerOpen: boolean;
  toggleMainDrawer: () => void;
  projectsDrawerOpen: boolean;
  toggleProjectsDrawer: () => void;
  projects: Project[];
  selectedStack: Stack | null;
  expandedProjects: Set<string>;
  toggleProjectExpansion: (projectName: string) => void;
  fetchStack: (projectName: string, stackName: string) => Promise<void>;
  setProjectsDrawerOpen: (open: boolean) => void;
  setExpandedProjects: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const location = useLocation();
  const params = useParams<{ projectName?: string; stackName?: string; tab?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'projects' && pathParts[3] === 'stacks') {
      const projectName = pathParts[2];
      const stackName = pathParts[4];
      setProjectsDrawerOpen(true);
      setExpandedProjects(prev => new Set(prev).add(projectName));
      fetchStack(projectName, stackName);
      if (!pathParts[5] || !['overview', 'readme', 'resources'].includes(pathParts[5])) {
        navigate(`/projects/${projectName}/stacks/${stackName}/overview`, { replace: true });
      }
    }
  }, [location, setProjectsDrawerOpen, setExpandedProjects, fetchStack, navigate]);

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
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/projects/:projectName/stacks/:stackName" element={<Navigate to="overview" replace />} />
          <Route path="/projects/:projectName/stacks/:stackName/:tab" element={<StackView />} />
          <Route path="/projects/:projectName/stacks/:stackName/resources/:resourceName" element={<StackView />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
