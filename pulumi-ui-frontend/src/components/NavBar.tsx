import React from 'react';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersIcon from '@mui/icons-material/Layers';

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
                },
            }}
        >
            <List>
                <ListItem disablePadding sx={{
                    justifyContent: mainDrawerOpen ? 'flex-end' : 'center',
                    paddingRight: mainDrawerOpen ? 1 : 0,
                }}>
                    <IconButton onClick={toggleMainDrawer} disableRipple>
                        {mainDrawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
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
                            }}>
                                <LayersIcon />
                            </ListItemIcon>
                            {mainDrawerOpen && <ListItemText primary="Stacks" sx={{ opacity: 1 }} />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default NavBar;