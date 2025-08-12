import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Variants d'apparition séquentielle
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ usersCount: 0, commandesCount: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (num) => typeof num === 'number' ? num.toLocaleString() : '0';
  const formatRevenue = (num) => Number(num).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/adm/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        usersCount: res.data.usersCount ?? 0,
        commandesCount: res.data.commandesCount ?? 0,
        revenue: Number(res.data.revenue) || 0,
      });
    } catch (err) {
      setError('Erreur lors du chargement des statistiques.');
    }
  };
  const fetchChart = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/adm/commandes-by-day', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChartData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Erreur lors du chargement du graphique.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchChart()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const barData = {
    labels: ['Utilisateurs', 'Commandes', 'Revenus'],
    datasets: [{
      label: 'Valeurs',
      data: [stats.usersCount, stats.commandesCount, stats.revenue],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc']
    }]
  };

  const lineData = {
    labels: chartData.map(d => d.date),
    datasets: [{
      label: 'Commandes / jour',
      data: chartData.map(d => d.count),
      borderColor: '#ff6384',
      backgroundColor: 'rgba(255,99,132,0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: { y: { beginAtZero: true } }
  };

  if (loading) {
    return <div className="dashboard-wrapper"><p>Chargement des données...</p></div>;
  }

  if (error) {
    return <div className="dashboard-wrapper"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <motion.div
      className="dashboard-wrapper"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 className="dashboard-title" variants={fadeSlideUp}>
        Tableau de bord - Administrateur
      </motion.h1>

      <motion.div className="stats-cards" variants={containerVariants}>
        <motion.div className="card users" variants={fadeSlideUp}>
          <h3>Utilisateurs</h3>
          <p>{formatNumber(stats.usersCount)}</p>
        </motion.div>
        <motion.div className="card commandes" variants={fadeSlideUp}>
          <h3>Commandes</h3>
          <p>{formatNumber(stats.commandesCount)}</p>
        </motion.div>
        <motion.div className="card revenue" variants={fadeSlideUp}>
          <h3>Revenu total (FCFA)</h3>
          <p>{formatRevenue(stats.revenue)}</p>
        </motion.div>
      </motion.div>

      <motion.div className="charts" variants={containerVariants}>
        <motion.div className="chart-container" variants={fadeSlideUp}>
          <h4>Résumé global</h4>
          <Bar data={barData} options={chartOptions} />
        </motion.div>
        <motion.div className="chart-container" variants={fadeSlideUp}>
          <h4>Commandes sur les 7 derniers jours</h4>
          {chartData.length === 0 ? (
            <p>Aucune donnée disponible pour les commandes récentes.</p>
          ) : (
            <Line data={lineData} options={chartOptions} />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
