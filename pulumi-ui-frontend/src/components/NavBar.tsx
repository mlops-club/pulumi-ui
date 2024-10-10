import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Box,
    Divider
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersIcon from '@mui/icons-material/Layers';
import HomeIcon from '@mui/icons-material/Home';

interface NavBarProps {
    mainDrawerOpen: boolean;
    toggleMainDrawer: () => void;
    toggleProjectsDrawer: () => void;
    projectsDrawerOpen: boolean;
}

const mainDrawerWidthOpen = 180;
const mainDrawerWidthClosed = 56;

const NavBar: React.FC<NavBarProps> = ({
    mainDrawerOpen,
    toggleMainDrawer,
    toggleProjectsDrawer,
    projectsDrawerOpen,
}) => {
    const navigate = useNavigate();

    return (
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
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                },
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                {mainDrawerOpen && (
                    <Box
                        component="img"
                        src="/logo-slim.png"
                        alt="Pulumi UI Logo"
                        sx={{
                            width: '100%',
                            height: 'auto',
                            padding: 2,
                            objectFit: 'contain',
                        }}
                    />
                )}
                <List>
                    <ListItem disablePadding>
                        <Tooltip title="Home" placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate('/')}
                                disableRipple
                                sx={{
                                    justifyContent: 'center',
                                    minHeight: 48,
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 0,
                                    mr: mainDrawerOpen ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: 'inherit',
                                }}>
                                    <HomeIcon />
                                </ListItemIcon>
                                {mainDrawerOpen && <ListItemText primary="Home" sx={{ opacity: 1 }} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                    <ListItem disablePadding>
                        <Tooltip title="Stacks" placement="right" arrow>
                            <ListItemButton
                                onClick={toggleProjectsDrawer}
                                selected={projectsDrawerOpen}
                                disableRipple
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
                                    color: 'inherit',
                                }}>
                                    <LayersIcon />
                                </ListItemIcon>
                                {mainDrawerOpen && <ListItemText primary="Stacks" sx={{ opacity: 1 }} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </List>
            </Box>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: mainDrawerOpen ? 'flex-end' : 'center' }}>
                <IconButton
                    onClick={toggleMainDrawer}
                    disableRipple
                    sx={{
                        width: mainDrawerOpen ? 'auto' : '100%',
                    }}
                >
                    {mainDrawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Box>
        </Drawer>
    );
};

export default NavBar;
