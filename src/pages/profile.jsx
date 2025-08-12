// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Avatar,
  Container,
  Box,
  Grid,
  Divider,
} from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    photo: '',
  });

  const [photoFile, setPhotoFile] = useState(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  //  Mise à jour du profil (nom, prénom, email, photo)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nom', user.nom);
    formData.append('prenom', user.prenom);
    formData.append('email', user.email);
    if (photoFile) formData.append('photo', photoFile);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Profil mis à jour avec succès');
    } catch (err) {
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  // Mise à jour du mot de passe
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('mot_de_passe', oldPassword);
    formData.append('nouveau_mot_de_passe', newPassword);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Mot de passe modifié avec succès');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      alert('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center" gutterBottom>
        Mon Profil
      </Typography>

      <form onSubmit={handleProfileUpdate}>
        <Box textAlign="center" mb={2}>
          <Avatar
            src={`${import.meta.env.VITE_API_URL}${user.photo}`}
            sx={{ width: 80, height: 80, margin: 'auto' }}
          />
          <input
            type="file"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            accept="image/*"
            style={{ marginTop: 10 }}
          />
        </Box>

        <TextField
          label="Nom"
          fullWidth
          margin="normal"
          value={user.nom}
          onChange={(e) => setUser({ ...user, nom: e.target.value })}
        />
        <TextField
          label="Prénom"
          fullWidth
          margin="normal"
          value={user.prenom}
          onChange={(e) => setUser({ ...user, prenom: e.target.value })}
        />
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, bgcolor: '#2e7d32' }}
        >
          Mettre à jour le profil
        </Button>
      </form>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Changer le mot de passe
      </Typography>

      <form onSubmit={handlePasswordUpdate}>
        <TextField
          type="password"
          label="Ancien mot de passe"
          fullWidth
          margin="normal"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Nouveau mot de passe"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, bgcolor: '#2e7d32' }}
        >
          Modifier le mot de passe
        </Button>
      </form>
    </Container>
  );
};

export default Profile;
