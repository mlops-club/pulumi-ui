import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import NavBar from './components/NavBar';
import StackExplorerBar from './components/StackExplorerBar';
import WelcomePage from './components/WelcomePage';
import StackView from './components/StackView';
import { Project, Stack } from './types';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mainDrawerOpen, setMainDrawerOpen] = useState(true);
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const toggleMainDrawer = () => {
    setMainDrawerOpen(!mainDrawerOpen);
  };

  const toggleProjectsDrawer = () => {
    setProjectsDrawerOpen(!projectsDrawerOpen);
  };

  const toggleProjectExpansion = (projectName: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const toggleColorMode = useCallback(() => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const fetchStack = async (projectName: string, stackName: string) => {
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
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
      },
    });
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex' }}>
          <NavBar
            mainDrawerOpen={mainDrawerOpen}
            toggleMainDrawer={toggleMainDrawer}
            toggleProjectsDrawer={toggleProjectsDrawer}
            projectsDrawerOpen={projectsDrawerOpen}
            darkMode={darkMode}
            toggleColorMode={toggleColorMode}
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
          <main style={{ flexGrow: 1, padding: '20px', height: '100vh', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route
                path="/projects/:projectName/stacks/:stackName/*"
                element={<StackView colorMode={darkMode ? 'dark' : 'light'} />} />
              <Route
                path="/projects/:projectName/stacks/:stackName/resources/:resourceName"
                element={<StackView colorMode={darkMode ? 'dark' : 'light'} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;