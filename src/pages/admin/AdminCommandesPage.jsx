import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔁 API URLs
const API = `${import.meta.env.VITE_API_URL}/api/admin/commandes`;
const API_CMD = `${import.meta.env.VITE_API_URL}/api/commandes`;
const API_ORDO = `${import.meta.env.VITE_API_URL}/api/ordonnances`;

// ✅ Modal déplacé ici pour éviter rerender et curseur disparu
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

 
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            width: 480,
            position: "relative",
            padding: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>{title}</h3>
          {children}
          <button
            onClick={onClose}
            aria-label="Fermer modal"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
              color: "#555",
            }}
          >
            &times;
          </button>
        </div>
      </div>
    </>
  );
};

const AdminCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [lines, setLines] = useState([]);
  const [ordos, setOrdos] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOrdoModal, setShowOrdoModal] = useState(false);
  const [messageAdmin, setMessageAdmin] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCommandes();
  }, []);

  useEffect(() => {
    filterCommandes();
  }, [search, filterStatus, commandes]);

  const fetchCommandes = async () => {
    try {
      const res = await axios.get(API, { headers });
      setCommandes(res.data);
    } catch {
      toast.error("Erreur lors du chargement des commandes");
    }
  };

  const filterCommandes = () => {
    const searchLower = search.toLowerCase();
    const result = commandes.filter((cmd) => {
      const matchNom =
        cmd.nom.toLowerCase().includes(searchLower) ||
        cmd.prenom.toLowerCase().includes(searchLower);
      const matchStatut = filterStatus ? cmd.statut === filterStatus : true;
      return matchNom && matchStatut;
    });
    setFiltered(result);
  };

  const showDetails = async (commande) => {
    setSelectedCommande(commande);
    try {
      const res = await axios.get(`${API_CMD}/${commande.id}`, { headers });
      setLines(res.data.lignes || []);
      setMessageAdmin(commande.message_admin || "");
      setShowDetailsModal(true);
    } catch {
      toast.error("Erreur chargement détails commande");
    }
  };

  const showOrdonnances = async (commande) => {
    setSelectedCommande(commande);
    try {
      const res = await axios.get(`${API_ORDO}/commande/${commande.id}`, {
        headers,
      });
      setOrdos(res.data || []);
      setShowOrdoModal(true);
    } catch {
      toast.error("Erreur chargement ordonnances");
    }
  };

  const changerStatut = async (statut) => {
    if (!selectedCommande) return;
    try {
      await axios.patch(
        `${API}/${selectedCommande.id}`,
        { statut, message_admin: messageAdmin },
        { headers }
      );
      toast.success(`Commande ${statut}`);
      setShowDetailsModal(false);
      setMessageAdmin("");
      fetchCommandes();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          min-height: 100vh;
          overflow-y: auto; /* ✅ Ajouté */
        }

        .page-title {
          font-size: 24px;
          font-weight: bold;
          color: #2a7a2a;
          margin-bottom: 20px;
          text-align: center;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .input, .select, textarea {
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-family: inherit;
        }

        .input { width: 280px; }
        .select { width: 160px; }
        textarea {
          width: 100%;
          resize: vertical;
          font-family: inherit;
        }

        .commande-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 960px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .commande-list {
            grid-template-columns: 1fr 1fr;
          }
        }

        .commande-card {
          background: white;
          border: 1px solid #ddd;
          padding: 16px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .commande-title {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 6px;
          color: #222;
        }

        .commande-date,
        .commande-statut,
        .msg-admin {
          font-size: 14px;
          margin-bottom: 6px;
          color: #444;
        }

        .statut-validee { color: #228B22; font-weight: 700; }
        .statut-refusee { color: #B22222; font-weight: 700; }
        .statut-annulee { color: #555; font-weight: 700; }
        .statut-attente { color: #1E90FF; font-weight: 700; }

        .btn {
          padding: 7px 14px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 8px;
          transition: background-color 0.3s ease;
          font-weight: 600;
          font-family: inherit;
        }

        .btn-green { background-color: #2a7a2a; color: white; }
        .btn-green:hover { background-color: #1f5c1f; }
        .btn-purple { background-color: #a9c9a9; color: white; }
        .btn-purple:hover { background-color: #a5d6a7; }
        .btn-red { background-color: #b22222; color: white; }
        .btn-red:hover { background-color: #7a1616; }
        .btn-gray { background-color: #777; color: white; }
        .btn-gray:hover { background-color: #555; }

        .med-line {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          padding: 6px 0;
        }
      `}</style>

      <h2 className="page-title">Commandes des utilisateurs</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher par nom ou prénom"
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validée">Validée</option>
          <option value="refusée">Refusée</option>
          <option value="annulée">Annulée</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>Aucune commande trouvée.</p>
      ) : (
        <div className="commande-list">
          {filtered.map((cmd) => (
            <div key={cmd.id} className="commande-card">
              <div className="commande-title">
                {cmd.nom} {cmd.prenom}
              </div>
              <div className="commande-date">
                Date : {new Date(cmd.date_commande).toLocaleString()}
              </div>
              <div className="commande-statut">
                Statut :{" "}
                <span
                  className={
                    cmd.statut === "validée"
                      ? "statut-validee"
                      : cmd.statut === "refusée"
                      ? "statut-refusee"
                      : cmd.statut === "annulée"
                      ? "statut-annulee"
                      : "statut-attente"
                  }
                >
                  {cmd.statut}
                </span>
              </div>
              {cmd.message_admin && (
                <div className="msg-admin">Message admin : {cmd.message_admin}</div>
              )}
              <div style={{ marginTop: "12px" }}>
                <button className="btn btn-green" onClick={() => showDetails(cmd)}>
                  Voir Médicaments
                </button>
                <button className="btn btn-purple" onClick={() => showOrdonnances(cmd)}>
                  Voir Ordonnances
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS */}
      <Modal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Médicaments commandés${selectedCommande ? ` - ${selectedCommande.nom} ${selectedCommande.prenom}` : ""}`}
      >
        {lines.length === 0 ? (
          <p>Aucun médicament trouvé.</p>
        ) : (
          lines.map((l) => (
            <div key={l.id} className="med-line">
              <span>{l.nom} × {l.quantite}</span>
              <span>{l.prix_unitaire * l.quantite} FCFA</span>
            </div>
          ))
        )}
        <textarea
          rows={5}
          value={messageAdmin}
          onChange={(e) => setMessageAdmin(e.target.value)}
          placeholder="Votre message ici..."
        />
        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn btn-green" onClick={() => changerStatut("validée")}>Valider</button>
          <button className="btn btn-red" onClick={() => changerStatut("refusée")}>Refuser</button>
          <button className="btn btn-gray" onClick={() => setShowDetailsModal(false)}>Fermer</button>
        </div>
      </Modal>

      {/* MODAL ORDONNANCES */}
      <Modal
        show={showOrdoModal}
        onClose={() => setShowOrdoModal(false)}
        title={`Ordonnances fournies${selectedCommande ? ` - ${selectedCommande.nom} ${selectedCommande.prenom}` : ""}`}
      >
        {ordos.length === 0 ? (
          <p>Aucune ordonnance</p>
        ) : (
          ordos.map((o) => (
            <div key={o.id} style={{ marginBottom: 10, fontSize: 14 }}>
              <a
                href={`${import.meta.env.VITE_API_URL}${o.fichier}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                Voir ordonnance #{o.id}
              </a>
            </div>
          ))
        )}
        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button className="btn btn-gray" onClick={() => setShowOrdoModal(false)}>
            Fermer
          </button>
        </div>
      </Modal>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default AdminCommandesPage;
