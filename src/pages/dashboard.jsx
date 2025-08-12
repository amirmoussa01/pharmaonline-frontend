import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Dashboard.css';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const Dashboard = () => {
  const [commandesCount, setCommandesCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCommandesCount(res.data.commandesCount || 0);
        setRevenue(res.data.revenue || 0);
        setRecentCommandes(res.data.recentCommandes || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError("Erreur lors du chargement du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <motion.div
      className="user-dashboard-wrapper"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="dashboard-title">Tableau de bord</h1>

      <div className="stats-cards">
        <motion.div className="card commandes" variants={cardVariants}>
          <h3>Total Commandes</h3>
          <p>{commandesCount.toLocaleString()}</p>
        </motion.div>

        <motion.div className="card revenue" variants={cardVariants}>
          <h3>Total Dépensé (FCFA)</h3>
          <p>{Number(revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </motion.div>
      </div>

      <div className="recent-orders">
        <h3>5 dernières commandes</h3>
        {recentCommandes.length === 0 ? (
          <p>Aucune commande récente.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentCommandes.map(cmd => (
                <motion.tr key={cmd.id} variants={rowVariants} initial="hidden" animate="visible">
                  <td>{cmd.id}</td>
                  <td>{new Date(cmd.date_commande).toLocaleDateString('fr-FR')}</td>
                  <td>{Number(cmd.montant_total).toLocaleString(undefined, { minimumFractionDigits: 2 })} FCFA</td>
                  <td>{cmd.statut}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
