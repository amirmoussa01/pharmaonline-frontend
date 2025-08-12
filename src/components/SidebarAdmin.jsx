// src/components/SidebarAdmin.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useMessages } from '../contexts/MessageContext'; 
import { Badge } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

import Logo from './Logo';

const SidebarAdmin = ({ user, isOpen }) => {
  const location = useLocation();
  const { unreadCount } = useMessages(); 

  const menuItems = [
    {
      text: 'Dashboard Admin',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      text: 'Catégories',
      icon: <CategoryIcon />,
      path: '/categories'
    },
    {
      text: 'Produits',
      icon: <InventoryIcon />,
      path: '/products'
    },
    {
      text: 'Commandes',
      icon: <AssignmentIcon />,
      path: '/admin/commandes'
    },
    {
      text: 'Utilisateurs',
      icon: <GroupIcon />,
      path: '/admin/users'
    },
    {
      text: 'Messagerie',
      path: '/messagerie-admin',
      icon: (
        <Box sx={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faEnvelope} />
          {unreadCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'red',
              }}
            />
          )}
        </Box>
      )
    },
  ];

  const photoUrl = user?.photo ? `${import.meta.env.VITE_API_URL}${user.photo}` : '/default_avatar.png';

  return (
    <Box
      sx={{
        width: isOpen ? 240 : 70,
        bgcolor: '#d9e9d9',
        height: '100vh',
        paddingTop: 2,
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Logo + App Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 4 }}>
        <Logo width={40} height={40} />
        {isOpen && (
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            Admin Panel
          </Typography>
        )}
      </Box>

      {/* Admin Avatar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          mb: 3,
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
          textDecoration: 'none',
        }}
        component={Link}
        to="/profile"
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <CircleIcon sx={{
              color: 'limegreen',
              fontSize: 12,
              border: '2px solid white',
              borderRadius: '50%',
              backgroundColor: 'white'
            }} />
          }
        >
          <Avatar src={photoUrl} sx={{ width: 60, height: 60, mb: 1 }} />
        </Badge>

        {isOpen && (
          <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            {user ? `${user.nom} ${user.prenom}` : 'Admin'}
          </Typography>
        )}
      </Box>
      {/* Menu Items */}
      <List>
        {menuItems.map(({ text, icon, path }) => {
          const item = (
            <ListItemButton
              key={text}
              component={Link}
              to={path}
              selected={location.pathname === path}
              sx={{
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: '#a5d6a7',
                  color: '#1b5e20',
                },
                justifyContent: isOpen ? 'initial' : 'center',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: isOpen ? 2 : 0 }}>
                {icon}
              </ListItemIcon>
              {isOpen && <ListItemText primary={text} />}
            </ListItemButton>
          );

          return isOpen ? item : (
            <Tooltip key={text} title={text} placement="right">
              {item}
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarAdmin;
