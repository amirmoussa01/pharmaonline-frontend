// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    photo: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => {
    if (e.target.name === 'photo') {
      setFormData({ ...formData, photo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('prenom', formData.prenom);
      data.append('email', formData.email);
      data.append('mot_de_passe', formData.mot_de_passe);
      if(formData.photo) data.append('photo', formData.photo);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '50px auto',
        padding: 20,
        backgroundColor: '#f6fff5',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,128,0,0.2)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Logo width={120} height={120} />
      </div>

      <h2 style={{ color: '#2e7d32', textAlign: 'center', marginBottom: 20 }}>Inscription</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="mot_de_passe"
          placeholder="Mot de passe"
          value={formData.mot_de_passe}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleChange}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: 'red', marginBottom: 15, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#2e7d32',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            width: '100%',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: 4,
          }}
        >
          {loading ? 'Patientez...' : 'S\'inscrire'}
        </button>
      </form>

      <p style={{ marginTop: 15, textAlign: 'center' }}>
        Déjà un compte ?{' '}
        <Link to="/login" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
          Connectez-vous
        </Link>
      </p>
    </div>
  );
};

const inputStyle = {
  width: '95%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

export default Register;
