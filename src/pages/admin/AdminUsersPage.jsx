import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, Button, Avatar, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, Select, MenuItem, TextField, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { green, red } from '@mui/material/colors';
import { useUser } from '../../contexts/UserContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActif, setFilterActif] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');

  const { user } = useUser();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          role: filterRole || undefined,
          actif: filterActif !== '' ? filterActif : undefined,
          sortBy,
          order: sortOrder
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole, filterActif, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Erreur suppression', err);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Erreur rôle", err);
    }
  };

  const handleActivationToggle = async (id, actif) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/activation`, { actif }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Erreur activation", err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: green[700] }} />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: green[800], fontWeight: 'bold' }}>
        Gestion des utilisateurs
      </Typography>

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Recherche"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl size="small">
          <InputLabel>Rôle</InputLabel>
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} label="Rôle">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="user">Utilisateur</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Statut</InputLabel>
          <Select value={filterActif} onChange={(e) => setFilterActif(e.target.value)} label="Statut">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="1">Actif</MenuItem>
            <MenuItem value="0">Inactif</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell onClick={() => toggleSort('nom')} style={{ cursor: 'pointer' }}>Nom</TableCell>
            <TableCell onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email</TableCell>
            <TableCell>Rôle</TableCell>
            <TableCell onClick={() => toggleSort('actif')} style={{ cursor: 'pointer' }}>Statut</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>
                <Avatar src={`${import.meta.env.VITE_API_URL}${u.photo}`} />
              </TableCell>
              <TableCell>{u.nom} {u.prenom}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="user">Utilisateur</MenuItem>
                    <MenuItem value="admin">Administrateur</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleActivationToggle(u.id, !u.actif)}
                  sx={{
                    bgcolor: u.actif ? green[600] : red[600],
                    '&:hover': {
                      bgcolor: u.actif ? green[800] : red[800]
                    }
                  }}
                >
                  {u.actif ? 'Actif' : 'Inactif'}
                </Button>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Voir">
                  <IconButton onClick={() => openModal(u)} sx={{ color: green[600] }}>
                    👁️
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleDelete(u.id)}
                    sx={{ bgcolor: red[800] }}
                  >
                    Supprimer le compte
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de détails */}
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle sx={{ bgcolor: green[100], fontWeight: 'bold' }}>
          Détails de l'utilisateur
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={`${import.meta.env.VITE_API_URL}${selectedUser.photo}`}
                sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}
              />
              <Typography variant="h6">
                {selectedUser.nom} {selectedUser.prenom}
              </Typography>
              <Typography color="text.secondary">{selectedUser.email}</Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Rôle:</strong> {selectedUser.role}
              </Typography>
              <Typography>
                <strong>Statut:</strong> {selectedUser.actif ? 'Actif' : 'Inactif'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} sx={{ color: green[700] }}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
