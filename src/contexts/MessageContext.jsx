import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const MessageContext = createContext();

export const useMessages = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      // L'utilisateur n'est probablement pas connecté
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/non-lus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.length || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn("Non autorisé : Token invalide ou expiré");
      } else {
        console.error("Erreur lors de la récupération des messages non lus:", err);
      }
    }
  };

  useEffect(() => {
    // Vérifie que le code tourne bien dans un navigateur
    if (typeof window !== 'undefined') {
      fetchUnread();
      const interval = setInterval(fetchUnread, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <MessageContext.Provider value={{ unreadCount, fetchUnread }}>
      {children}
    </MessageContext.Provider>
  );
};
