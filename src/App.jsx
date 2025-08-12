import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { MessageProvider } from './contexts/MessageContext';
import { useUser } from './contexts/UserContext';
import UserMessagesPage from './pages/messagerie/UserMessagesPage';
import AdminMessagesPage from './pages/messagerie/AdminMessagesPage';

import SidebarAdmin from './components/SidebarAdmin';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import Footer from './components/footer';

import Dashboard from './pages/dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/profile';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import ProductPageUser from './pages/ProductPageUser';
import CommandePage from './pages/CommandePage';
import AdminCommandesPage from './pages/admin/AdminCommandesPage';
import Accueil from './pages/Accueil';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import axios from 'axios';

function App() {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        });
    }
  }, [setIsAuthenticated, setUser]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <Router>
      <MessageProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {isAuthenticated && isAdmin && <SidebarAdmin user={user} isOpen={isSidebarOpen} />}
          {isAuthenticated && isUser && <Sidebar user={user} isOpen={isSidebarOpen} />}

          <div style={{ flex: 1 }}>
            {isAuthenticated && <Navbar user={user} onToggleSidebar={toggleSidebar} />}

            <div style={{ padding: 20, minHeight: 'calc(100vh - 64px - 100px)' }}>
              <Routes>
                <Route path="/" element={isAuthenticated ? (isAdmin ? <AdminDashboard /> : <Dashboard />) : <Accueil />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

                <Route path="/productsuser" element={isAuthenticated && isUser ? <ProductPageUser /> : <Navigate to="/" />} />
                <Route path="/mes-commandes" element={isAuthenticated && isUser ? <CommandePage /> : <Navigate to="/" />} />
                <Route path="/messagerie" element={<UserMessagesPage />} />

                <Route path="/products" element={isAuthenticated && isAdmin ? <ProductPage /> : <Navigate to="/" />} />
                <Route path="/categories" element={isAuthenticated && isAdmin ? <CategoryPage /> : <Navigate to="/" />} />
                <Route path="/admin/dashboard" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/admin/commandes" element={isAuthenticated && isAdmin ? <AdminCommandesPage /> : <Navigate to="/" />} />
                <Route path="/admin/users" element={isAuthenticated && isAdmin ? <AdminUsersPage /> : <Navigate to="/" />} />
                <Route path="/messagerie-admin" element={<AdminMessagesPage />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </div>
      </MessageProvider>
    </Router>
  );
}

export default App;
