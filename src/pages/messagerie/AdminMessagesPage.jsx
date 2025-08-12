import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useUser } from '../../contexts/UserContext';
import './AdminMessagesPage.css';

const API = `${import.meta.env.VITE_API_URL}/api/messages`;
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

const AdminMessagesPage = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [unreadMap, setUnreadMap] = useState({});
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef();

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/utilisateurs?search=${search}`, { headers: authHeader() });
      setUsers(res.data);
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversation = async (uid) => {
    try {
      const res = await axios.get(`${API}/conversation/${uid}`, { headers: authHeader() });
      setConversation(res.data);
      markAllAsRead(res.data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await axios.get(`${API}/non-lus`, { headers: authHeader() });
      const counts = {};
      res.data.forEach(m => counts[m.expediteur_id] = (counts[m.expediteur_id] || 0) + 1);
      setUnreadMap(counts);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    try {
      const res = await axios.post(API, {
        destinataire_id: selectedUser.id,
        contenu: newMsg
      }, { headers: authHeader() });

      setNewMsg('');
      setConversation(prev => [...prev, res.data]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async (msgs) => {
    const unread = msgs.filter(m => m.destinataire_id === user.id && !m.lu);
    try {
      await Promise.all(unread.map(m =>
        axios.patch(`${API}/${m.id}/lu`, {}, { headers: authHeader() })
      ));
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (selectedUser) fetchConversation(selectedUser.id);
  }, [selectedUser]);

  useEffect(() => {
    socket.emit('join', { userId: user.id, role: 'admin' });

    socket.on('new_message', (message) => {
      if (message.expediteur_id === selectedUser?.id || message.destinataire_id === selectedUser?.id) {
        setConversation(prev => [...prev, message]);
        scrollToBottom();
      }
      fetchUnread();
    });

    socket.on('online_users', (userIds) => {
      setOnlineUsers(userIds.map(id => id.toString()));
    });

    return () => {
      socket.off('new_message');
      socket.off('online_users');
    };
  }, [selectedUser]);

  return (
    <div className="ump-container">
      {/* BOUTON BURGER TOUJOURS VISIBLE */}
      <button className="ump-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      {/* SIDEBAR UTILISATEURS */}
      <aside className={`ump-sidebar ${!sidebarOpen ? 'hidden' : ''}`}>
        <h3 className="title">
          -- Utilisateurs --
          {Object.values(unreadMap).reduce((a, b) => a + b, 0) > 0 && ' 🔔'}
        </h3>
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ump-search"
        />
        {users.map(u => (
          <div
            key={u.id}
            className={`ump-contact ${selectedUser?.id === u.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(u)}
          >
            <div className="ump-avatar-wrapper">
              <img src={`${import.meta.env.VITE_API_URL}${u.photo}`} alt={u.prenom} />
              {onlineUsers.includes(u.id.toString()) && (
                <span className="ump-online-dot" title="En ligne" />
              )}
            </div>
            <span>{u.prenom} {u.nom}</span>
            {unreadMap[u.id] && <span className="ump-badge">{unreadMap[u.id]}</span>}
          </div>
        ))}
      </aside>

      {/* ZONE DE CHAT */}
      <section className="ump-chat">
        {selectedUser ? (
          <>
            <header>
              <div className="ump-avatar-wrapper">
                <img
                  src={`${import.meta.env.VITE_API_URL}${selectedUser.photo}`}
                  alt={selectedUser.prenom}
                />
                {onlineUsers.includes(selectedUser.id.toString()) && (
                  <span className="ump-online-dot" title="En ligne" />
                )}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginLeft: '10px' }}>
                {selectedUser.prenom} {selectedUser.nom}
              </span>
            </header>

            <div className="messages">
              {conversation.map(m => (
                <div key={m.id} className={`msg ${m.expediteur_id === user.id ? 'sent' : 'received'}`}>
                  <strong>{m.expediteur_id === user.id ? 'Admin' : 'Utilisateur'}</strong>
                  <p>{m.contenu}</p>
                  <small>{new Date(m.created_at).toLocaleString('fr-FR')}</small>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="input-area">
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Écrire un message…"
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <div className="empty">Sélectionne un utilisateur pour discuter.</div>
        )}
      </section>
    </div>
  );
};

export default AdminMessagesPage;
