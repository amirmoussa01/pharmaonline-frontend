import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useUser } from '../../contexts/UserContext';
import './UserMessagesPage.css';

const API = `${import.meta.env.VITE_API_URL}/api/messages`;
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

const UserMessagesPage = () => {
  const { user } = useUser();
  const [admins, setAdmins] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [unreadMap, setUnreadMap] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true); // Pour le menu
  const scrollRef = useRef();

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API}/admins`, { headers: authHeader() });
      setAdmins(res.data);
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversation = async (adminId) => {
    try {
      const res = await axios.get(`${API}/conversation/${adminId}`, { headers: authHeader() });
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
      res.data.forEach((m) => {
        counts[m.expediteur_id] = (counts[m.expediteur_id] || 0) + 1;
      });
      setUnreadMap(counts);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedAdmin) return;
    try {
      const res = await axios.post(
        API,
        { destinataire_id: selectedAdmin.id, contenu: newMsg },
        { headers: authHeader() }
      );
      setNewMsg('');
      setConversation((prev) => [...prev, res.data]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async (msgs) => {
    const unread = msgs.filter((m) => m.destinataire_id === user.id && !m.lu);
    try {
      await Promise.all(
        unread.map((m) => axios.patch(`${API}/${m.id}/lu`, {}, { headers: authHeader() }))
      );
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    fetchAdmins();
    socket.emit('join', { userId: user.id, role: 'user' });

    socket.on('new_message', (message) => {
      if (
        message.expediteur_id === selectedAdmin?.id ||
        message.destinataire_id === selectedAdmin?.id
      ) {
        setConversation((prev) => [...prev, message]);
        scrollToBottom();
      }
      fetchUnread();
    });

    socket.on('updateOnlineAdmins', (adminIds) => {
      setOnlineAdmins(adminIds.map((id) => id.toString()));
    });

    return () => {
      socket.off('new_message');
      socket.off('updateOnlineAdmins');
    };
  }, [selectedAdmin, user.id]);

  useEffect(() => {
    if (selectedAdmin) fetchConversation(selectedAdmin.id);
  }, [selectedAdmin]);

  const OnlineIndicator = () => (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#4CAF50',
        marginLeft: -15,
        marginTop: 25,
        border: '2px solid white',
        position: 'absolute',
        right: 2,
        top: 2,
        zIndex: 10,
      }}
      title="En ligne"
    />
  );

  return (
    <div className="ump-container">
      {/* Menu burger visible partout */}
      <button className="ump-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      {sidebarOpen && (
        <aside className="ump-sidebar">
          <h3 className="title">
            -- Admins --{' '}
            {Object.values(unreadMap).reduce((a, b) => a + b, 0) > 0 && ' 🔔'}
          </h3>

          {admins.map((a) => {
            const isOnline = onlineAdmins.includes(a.id.toString());
            return (
              <div
                key={a.id}
                className={`ump-contact ${selectedAdmin?.id === a.id ? 'selected' : ''}`}
                onClick={() => setSelectedAdmin(a)}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}${a.photo}`}
                    alt={a.prenom}
                    style={{ borderRadius: '50%', width: 40, height: 40 }}
                  />
                  {isOnline && <OnlineIndicator />}
                </div>
                <span>@admin {a.prenom}</span>
                {unreadMap[a.id] && <span className="ump-badge">{unreadMap[a.id]}</span>}
              </div>
            );
          })}
        </aside>
      )}

      <section className="ump-chat">
        {selectedAdmin ? (
          <>
            <header>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={`${import.meta.env.VITE_API_URL}${selectedAdmin.photo}`}
                  alt={selectedAdmin.prenom}
                  style={{ borderRadius: '50%', width: 50, height: 50 }}
                />
                {onlineAdmins.includes(selectedAdmin.id.toString()) && <OnlineIndicator />}
              </div>
              <span>@admin {selectedAdmin.prenom}</span>
            </header>
            <div className="messages">
              {conversation.map((m) => (
                <div
                  key={m.id}
                  className={`msg ${m.expediteur_id === user.id ? 'sent' : 'received'}`}
                >
                  <strong>{m.expediteur_id === user.id ? 'Moi' : 'Admin'}</strong>
                  <p>{m.contenu}</p>
                  <small>{new Date(m.created_at).toLocaleString('fr-FR')}</small>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className="input-area">
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écrire un message…"
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <div className="empty">Sélectionne un admin pour discuter.</div>
        )}
      </section>
    </div>
  );
};

export default UserMessagesPage;
