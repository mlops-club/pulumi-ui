import React from 'react';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { Project, Stack } from '../types';

interface StackExplorerBarProps {
    projects: Project[];
    selectedStack: Stack | null;
    projectsDrawerOpen: boolean;
    mainDrawerOpen: boolean;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectName: string) => void;
    fetchStack: (projectName: string, stackName: string) => void;
}

const projectsDrawerWidth = 240;
const mainDrawerWidthOpen = 180; // Updated to match NavBar
const mainDrawerWidthClosed = 56;

const StackExplorerBar: React.FC<StackExplorerBarProps> = ({
    projects,
    selectedStack,
    projectsDrawerOpen,
    mainDrawerOpen,
    expandedProjects,
    toggleProjectExpansion,
    fetchStack,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectName: currentProjectName, stackName: currentStackName } = useParams<{ projectName?: string; stackName?: string }>();

    const handleStackClick = (projectName: string, stackName: string) => {
        fetchStack(projectName, stackName);
        navigate(`/projects/${projectName}/stacks/${stackName}/overview`);
    };

    const isStackSelected = (projectName: string, stackName: string) => {
        const pathParts = location.pathname.split('/');
        return pathParts[2] === projectName && pathParts[4] === stackName;
    };

    return (
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
                    // Removed paddingTop
                },
            }}
        >
            <List>
                {projects.map((project) => (
                    <React.Fragment key={project.name}>
                        <ListItemButton onClick={() => toggleProjectExpansion(project.name)} disableRipple>
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
                                            '&.Mui-selected': {
                                                backgroundColor: 'action.selected',
                                            },
                                            '&.Mui-selected:hover': {
                                                backgroundColor: 'action.selected',
                                            },
                                        }}
                                        onClick={() => handleStackClick(project.name, stack.name)}
                                        selected={isStackSelected(project.name, stack.name)}
                                        disableRipple
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
    );
};

export default StackExplorerBar;
