import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { toast, ToastContainer } from "react-toastify";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        email,
        mot_de_passe,
      });
      
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
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

      <h2 style={{ color: '#2e7d32', textAlign: 'center', marginBottom: 20 }}>Connexion</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="mot_de_passe"
          placeholder="Mot de passe"
          value={mot_de_passe}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
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
          {loading ? 'Patientez...' : 'Se connecter'}
          
        </button>
      </form>

      <p style={{ marginTop: 15, textAlign: 'center' }}>
        Pas encore de compte ?{' '}
        <Link to="/register" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
          Inscrivez-vous
        </Link>
      </p>
      <ToastContainer position="top-right" />
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

export default Login;
