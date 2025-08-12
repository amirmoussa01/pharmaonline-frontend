import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faPencilAlt,
  faFileMedical,
  faMoneyBill,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import './modal.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_CMD = `${import.meta.env.VITE_API_URL}/api/commandes`;
const API_ORDO = `${import.meta.env.VITE_API_URL}/api/ordonnances`;
const API_PAY = `${import.meta.env.VITE_API_URL}/api/paiements`;

const CommandePage = () => {
  const [orders, setOrders] = useState([]);
  const [linesByOrder, setLinesByOrder] = useState({});
  const [ordosByOrder, setOrdosByOrder] = useState({});
  const [editLine, setEditLine] = useState(null);
  const [qtyEdit, setQtyEdit] = useState(1);
  const [ordoFile, setOrdoFile] = useState(null);
  const [modalOrdo, setModalOrdo] = useState(null);
  const [ordoDate, setOrdoDate] = useState("2025-12-31");
  const [ordoFileEdit, setOrdoFileEdit] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_CMD}/mes-commandes`, { headers });
      setOrders(res.data);

      const linesMap = {};
      const ordosMap = {};

      for (const order of res.data) {
        const resLines = await axios.get(`${API_CMD}/${order.id}`, { headers });
        linesMap[order.id] = resLines.data.lignes || [];

        const resOrdos = await axios.get(`${API_ORDO}/commande/${order.id}`, { headers });
        ordosMap[order.id] = resOrdos.data || [];
      }

      setLinesByOrder(linesMap);
      setOrdosByOrder(ordosMap);
    } catch (e) {
      toast.error("Erreur lors du chargement");
    }
  };

  const totalMontant = (lines) =>
    lines.reduce((acc, l) => acc + l.quantite * l.prix_unitaire, 0);

  const saveEdit = async () => {
    const qty = parseInt(qtyEdit, 10);
    if (isNaN(qty) || qty <= 0) return toast.error("Quantité invalide");
    await axios.put(`${API_CMD}/ligne/${editLine.id}`, { quantite: qty }, { headers });
    toast.success("Quantité mise à jour");
    setEditLine(null);
    fetchOrders();
  };

  const deleteLine = async (ligneId) => {
    await axios.delete(`${API_CMD}/ligne/${ligneId}`, { headers });
    toast.success("Produit supprimé");
    fetchOrders();
  };

  const uploadOrdo = async (orderId) => {
    if (!ordoFile) return toast.error("Sélectionnez un fichier");
    const form = new FormData();
    form.append("id_commande", orderId);
    form.append("date_expiration", "2025-12-31");
    form.append("fichier", ordoFile);

    try {
      await axios.post(API_ORDO, form, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      toast.success("Ordonnance ajoutée");
      setOrdoFile(null);
      fetchOrders();
    } catch (e) {
      console.error("Erreur ajout ordonnance:", e);
      toast.error("Erreur lors de l'ajout de l'ordonnance");
    }
  };

  const deleteOrdo = async (ordoId) => {
    await axios.delete(`${API_ORDO}/${ordoId}`, { headers });
    toast.success("Ordonnance supprimée");
    fetchOrders();
  };

  const cancelOrder = async (id) => {
    await axios.patch(`${API_CMD}/annuler/${id}`, {}, { headers });
    toast.success("Commande annulée");
    fetchOrders();
  };

  const updateOrdo = async () => {
    if (!modalOrdo) return;

    const form = new FormData();
    if (ordoFileEdit) form.append("fichier", ordoFileEdit);
    form.append("date_expiration", ordoDate);

    try {
      await axios.put(`${API_ORDO}/${modalOrdo.id}`, form, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      toast.success("Ordonnance mise à jour");
      setModalOrdo(null);
      setOrdoFileEdit(null);
      fetchOrders();
    } catch (e) {
      console.error("Erreur mise à jour ordonnance:", e);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const openPaiementFlow = (order) => {
    setSelectedOrder(order);
    setShowAddrModal(true);
  };

  const handlePaiement = async (typePaiement) => {
    try {
      if (!adresse.trim() || !telephone.trim()) {
        toast.error("Vous devez remplir les champs Adresse et téléphone");
        return;
      }

      await axios.post(API_PAY, {
        id_commande: selectedOrder.id,
        adresse,
        telephone,
        description,
        type_paiement: typePaiement,
        statut: "en_attente"
      }, { headers });

      toast.success("Paiement enregistré avec succès");
      setShowAddrModal(false);
      setShowPayModal(false);
      setAdresse("");
      setTelephone("");
      setDescription("");
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du paiement");
    }
  };

  const genererRecu = (commande, lignes) => {
  if (!lignes.length) {
    toast.error("Aucune ligne de commande pour générer le reçu");
    return;
  }

  const doc = new jsPDF();

  const greenPharma = "#2e7d32";

  // Bande verte en haut
  doc.setFillColor(greenPharma);
  doc.rect(0, 0, 210, 25, "F");

  // Titre blanc centré
  doc.setTextColor("#fff");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PharmaOnline - Reçu de paiement", 105, 16, { align: "center" });

  // Reset couleur texte pour contenu
  doc.setTextColor("#000");
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Infos commande avec fallback
  const clientNom = commande.nom || "Client";
  const clientPrenom = commande.prenom || "";
  const clientAdresse = commande.adresse || "Non fournie";

  doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`Commande #: ${commande.id}`, 20, 48);
  doc.text(`Client : ${clientNom} ${clientPrenom}`, 20, 56);
  doc.text(`Adresse : ${clientAdresse}`, 20, 64);

  // En-tête tableau simplifié (colonnes alignées)
  const startY = 75;
  doc.setFont("helvetica", "bold");
  doc.text("#", 20, startY);
  doc.text("Produit", 30, startY);
  doc.text("Quantité", 100, startY);
  doc.text("Prix U", 130, startY);
  doc.text("Total", 160, startY);

  doc.setFont("helvetica", "normal");

  // Corps du tableau, ligne par ligne
  let y = startY + 8;
  lignes.forEach((l, i) => {
    const totalLigne = l.quantite * l.prix_unitaire;
    doc.text(`${i + 1}`, 20, y);
    doc.text(l.nom, 30, y);
    doc.text(`${l.quantite}`, 100, y);
    doc.text(`${l.prix_unitaire.toLocaleString()} FCFA`, 130, y);
    doc.text(`${totalLigne.toLocaleString()} FCFA`, 160, y);
    y += 8;
  });

  // Total général en vert et gras, un peu plus grand
  const total = lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(greenPharma);
  doc.text(`Montant total payé : ${total.toLocaleString()} FCFA`, 20, y);

  // Message de remerciement en gris clair et italique
  y += 12;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text("Merci pour votre confiance. À bientôt sur PharmaOnline.", 20, y);

  // Sauvegarde PDF
  doc.save(`recu_commande_${commande.id}.pdf`);
};


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mes Commandes</h2>

      <div style={{ marginBottom: 20 }}>
        <button style={styles.btn} onClick={() => navigate("/productsuser")}>
          <FontAwesomeIcon icon={faPlus} /> Commander un produit
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <h3>Aucune commande pour le moment</h3>
        </div>
      ) : (
        <div style={styles.grid}>
          {orders.map((order, index) => {
            const modifiable = order.statut === "en_attente";
            return (
              <div key={order.id} style={styles.card}>
                <strong>Commande #{index + 1}</strong>
                <div>
                  Statut :{" "}
                  <span
                    style={{
                      color:
                        order.statut === "annulée"
                          ? "#d32f2f"
                          : order.statut === "expédiée"
                          ? "#1976d2"
                          : "#2e7d32",
                      fontWeight: "bold",
                    }}
                  >
                    {order.statut}
                  </span>
                </div>

                {order.message_admin && (
                  <div style={{ marginTop: 4, fontSize: 13, color: "#444" }}>
                    <em>Message admin : {order.message_admin}</em>
                  </div>
                )}

                <div style={styles.section}>
                  {(linesByOrder[order.id] || []).map((l) => (
                    <div key={l.id} style={styles.line}>
                      {editLine?.id === l.id ? (
                        <>
                          <input
                            type="number"
                            value={qtyEdit}
                            onChange={(e) => setQtyEdit(e.target.value)}
                            style={styles.qtyInput}
                          />
                          <button
                            onClick={saveEdit}
                            style={styles.smallBtn}
                            disabled={!modifiable}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} /> Save
                          </button>
                        </>
                      ) : (
                        <>
                          {l.nom} • {l.prix_unitaire.toLocaleString()} FCFA × {l.quantite} ={" "}
                          <strong>{(l.prix_unitaire * l.quantite).toLocaleString()} FCFA</strong>
                          {modifiable && (
                            <div>
                              <FontAwesomeIcon
                                icon={faPencilAlt}
                                style={styles.icon}
                                onClick={() => {
                                  setEditLine(l);
                                  setQtyEdit(l.quantite);
                                }}
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                style={{ ...styles.icon, color: "#d32f2f" }}
                                onClick={() => deleteLine(l.id)}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div style={styles.total}>
                    Total :{" "}
                    <strong>
                      {totalMontant(linesByOrder[order.id] || []).toLocaleString()} FCFA
                    </strong>
                  </div>
                </div>

                <div style={styles.section}>
                  <h4>Ordonnances</h4>
                  {(ordosByOrder[order.id] || []).map((o) => (
                    <div key={o.id} style={styles.line}>
                      <a
                        href={`${import.meta.env.VITE_API_URL}${o.fichier}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir ordonnance #{o.id}
                      </a>
                      <div>
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          style={styles.icon}
                          onClick={() => {
                            setModalOrdo(o);
                            setOrdoDate(o.date_expiration || "2025-12-31");
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ ...styles.icon, color: "#d32f2f" }}
                          onClick={() => deleteOrdo(o.id)}
                        />
                      </div>
                    </div>
                  ))}
                  <input
                    type="file"
                    onChange={(e) => setOrdoFile(e.target.files[0])}
                    accept="application/pdf,image/*"
                    disabled={!modifiable}
                  />
                  <button
                    style={styles.smallBtn}
                    onClick={() => uploadOrdo(order.id)}
                    disabled={!modifiable}
                  >
                    <FontAwesomeIcon icon={faFileMedical} /> Ajouter ordonnance
                  </button>
                </div>

                <div style={styles.actions}>
                  <button style={styles.btn} onClick={() => navigate("/productsuser")} disabled={!modifiable}>
                    <FontAwesomeIcon icon={faPlus} /> Produit
                  </button>
                  <button style={styles.btn} onClick={() => openPaiementFlow(order)} disabled={order.statut !== "validée"}>
                    <FontAwesomeIcon icon={faMoneyBill} /> Payer
                  </button>
                  <button style={styles.redBtn} onClick={() => cancelOrder(order.id)} disabled={!modifiable}>
                    <FontAwesomeIcon icon={faTrash} /> Annuler
                  </button>
                  {order.statut === 'payée' && (
                    <button
                      style={{ ...styles.smallBtn, background: "#6a1b9a", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={() => genererRecu(order, linesByOrder[order.id] || [])}
                    >
                      <FontAwesomeIcon icon={faFileMedical} />
                      Reçu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Adresse */}
      {showAddrModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Adresse de livraison</h3>
            <input
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse complète"
            />
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Téléphone"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (facultatif)"
            />

            {/* Affichage message d'erreur si champs manquants */}
            {(!adresse.trim() || !telephone.trim()) && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>
                Veuillez renseigner l'adresse complète et le téléphone.
              </p>
            )}

            <button
              onClick={() => {
                if (adresse.trim() && telephone.trim()) {
                  setShowAddrModal(false);
                  setShowPayModal(true);
                }
                // Sinon ne fait rien (bloque la progression)
              }}
            >
              Suivant
            </button>
            <button onClick={() => setShowAddrModal(false)}>Annuler</button>
          </div>
        </div>
      )}

      {/* Modal 2: Type de paiement */}
      {showPayModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Choisissez le mode de paiement</h3>
            <button onClick={() => handlePaiement("en_ligne")}>Payer en ligne</button>
            <button onClick={() => handlePaiement("a_la_livraison")}>Payer à la livraison</button>
            <button onClick={() => setShowPayModal(false)}>Annuler</button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

const styles = {
  container: { padding: 20, fontFamily: "Segoe UI" },
  title: { color: "#2e7d32", marginBottom: 15 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  card: { padding: 15, borderRadius: 8, background: "#f0fdf4", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  btn: { background: "#2e7d32", color: "white", padding: "6px 10px", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 },
  redBtn: { background: "#d32f2f", color: "white", padding: "6px 10px", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 },
  empty: { textAlign: "center", marginTop: 50 },
  section: { marginTop: 10 },
  line: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "6px 0", alignItems: "center", gap: 10, fontSize: 13 },
  icon: { cursor: "pointer", marginLeft: 8 },
  qtyInput: { width: 60, padding: 4, border: "1px solid #ccc", borderRadius: 4 },
  smallBtn: { background: "#1976d2", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12, marginTop: 6 },
  total: { textAlign: "right", fontWeight: "bold", marginTop: 8 }
};

export default CommandePage;
