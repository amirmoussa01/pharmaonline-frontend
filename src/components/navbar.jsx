import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem,
  Box, Tooltip, Stack, Chip, Fade, Badge, useMediaQuery, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { alpha, useTheme } from '@mui/material/styles';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, setIsAuthenticated, setUser } = useUser();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
    handleCloseUserMenu();
  };

  const photoUrl = user?.photo
    ? user.photo.startsWith('http')
      ? user.photo
      : `${import.meta.env.VITE_API_URL}${user.photo}`
    : '/default-avatar.png';

  const isAdmin = user?.role === 'admin';

  return (
    <AppBar position="static" sx={{ backgroundColor: '#4CAF50' }}>
      <Toolbar>

        {/* Sidebar toggle button */}
        <IconButton edge="start" color="inherit" onClick={onToggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        {/* App Title */}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {/* Tu peux mettre un titre ici si tu veux */}
        </Typography>

        {/* User Section */}
        <Box
          sx={{
            ml: 2,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: alpha('#ffffff', 0.3),
            p: 0.5,
            borderRadius: 8,
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.5),
            }
          }}
          onClick={handleOpenUserMenu}
          role="button"
          aria-label="Menu utilisateur"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenUserMenu(e);
            }
          }}
        >
          <Tooltip title="Compte utilisateur">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <CircleIcon sx={{ color: 'limegreen', fontSize: 12, border: '2px solid white', borderRadius: '50%' }} />
              }
            >
              <Avatar
                alt={`${user?.prenom} ${user?.nom}`}
                src={photoUrl}
                sx={{ width: 40, height: 40, mr: 1 }}
              />
            </Badge>
          </Tooltip>

          {!isMobile && (
            <>
              <Stack direction="column" spacing={0} sx={{ mr: 1 }}>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                  {user?.prenom} {user?.nom}
                </Typography>
                <Typography sx={{ color: '#ddd', fontSize: 12 }}>
                  {user?.email}
                </Typography>
              </Stack>
              <Chip
                label={isAdmin ? 'Admin' : 'Client'}
                size="small"
                sx={{
                  mr: 1,
                  backgroundColor: isAdmin ? '#673ab7' : '#2196f3',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 11
                }}
              />
            </>
          )}

          <ExpandMoreIcon sx={{ color: 'white' }} />
        </Box>

        {/* Menu déroulant */}
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          TransitionComponent={Fade}
          sx={{ mt: '45px' }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Paramètres
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
