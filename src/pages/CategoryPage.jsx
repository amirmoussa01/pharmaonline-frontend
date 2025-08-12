import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  faEye,
  faPen,
  faTrash,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/categories`;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [form, setForm] = useState({ nom: "", description: "" });

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_BASE);
      setCategories(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des catégories");
    }
  };

  const searchCategories = async (query) => {
    if (!query) return fetchCategories();
    try {
      const res = await axios.get(`${API_BASE}/search?q=${query}`);
      setCategories(res.data);
    } catch (err) {
      toast.error("Erreur lors de la recherche");
    }
  };

  const openModal = (type, category = null) => {
    setModalType(type);
    setCurrentCategory(category);
    setForm(category || { nom: "", description: "" });
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentCategory(null);
    setForm({ nom: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await axios.post(API_BASE, form, config);
        toast.success("Catégorie ajoutée");
      } else if (modalType === "edit" && currentCategory) {
        await axios.put(`${API_BASE}/${currentCategory.id}`, form, config);
        toast.success("Catégorie modifiée");
      }
      closeModal();
      fetchCategories();
    } catch {
      toast.error("Désolé !! Acces non autorisé");
    }
  };

  const handleDelete = async () => {
  try {
    await axios.delete(`${API_BASE}/${currentCategory.id}`, config);
    toast.success("Catégorie supprimée");
    closeModal();
    fetchCategories();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      toast.error(error.response.data.message);
    } else if (error.response && error.response.status === 404) {
      toast.error("Catégorie introuvable.");
    } else {
      toast.error("Erreur serveur lors de la suppression.");
    }
  }
};
 

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestion des Catégories</h2>

      <div style={styles.actions}>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchCategories(e.target.value);
          }}
          style={styles.input}
        />
        <button onClick={() => openModal("add")} style={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Ajouter
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                  Chargement des categories en cours...
                </td>
              </tr>
            )}
            {categories.map((cat, index) => (
              <tr key={cat.id} style={styles.tr}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>{cat.nom}</td>
                <td style={styles.td}>{cat.description || "-"}</td>
                <td style={styles.td}>
                  <FontAwesomeIcon
                    icon={faEye}
                    style={styles.icon}
                    title="Voir"
                    onClick={() => openModal("view", cat)}
                  />
                  <FontAwesomeIcon
                    icon={faPen}
                    style={styles.icon}
                    title="Modifier"
                    onClick={() => openModal("edit", cat)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ ...styles.icon, color: "#d32f2f" }}
                    title="Supprimer"
                    onClick={() => openModal("delete", cat)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalType && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button onClick={closeModal} style={styles.closeBtn}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {(modalType === "add" || modalType === "edit") && (
              <>
                <h3 style={styles.modalTitle}>
                  {modalType === "add" ? "Ajouter" : "Modifier"} une catégorie
                </h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <label style={styles.label}>
                    Nom *
                    <input
                      type="text"
                      placeholder="Nom *"
                      value={form.nom}
                      onChange={(e) =>
                        setForm({ ...form, nom: e.target.value })
                      }
                      required
                      style={styles.inputModal}
                    />
                  </label>
                  <label style={styles.label}>
                    Description
                    <textarea
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      style={styles.textareaModal}
                    />
                  </label>
                  <button type="submit" style={styles.addButton}>
                    Enregistrer
                  </button>
                </form>
              </>
            )}

            {modalType === "view" && (
              <>
                <h3 style={styles.modalTitle}>Détails de la catégorie</h3>
                <p>
                  <strong>Nom :</strong> {currentCategory.nom}
                </p>
                <p>
                  <strong>Description :</strong>{" "}
                  {currentCategory.description || "—"}
                </p>
              </>
            )}

            {modalType === "delete" && (
              <>
                <h3 style={styles.modalTitle}>Confirmation</h3>
                <p>
                  Voulez-vous vraiment supprimer la catégorie{" "}
                  <strong>{currentCategory.nom}</strong> ?
                </p>
                <button onClick={handleDelete} style={styles.deleteButton}>
                  Oui, supprimer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

// 🎨 Styles
const green = "#2e7d32";

const styles = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    color: green,
    marginBottom: 10,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    minWidth: 200,
    flexGrow: 1,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: green,
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    whiteSpace: "nowrap",
    alignSelf: "flex-start",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: 5,
    marginTop: 10,
    cursor: "pointer",
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #ccc",
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    minWidth: 600,
    borderCollapse: "collapse",
  },
  thead: {
    backgroundColor: "#e8f5e9",
  },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #ccc",
    color: green,
    fontWeight: "bold",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  },
  tr: {
    transition: "background-color 0.2s ease",
  },
  icon: {
    cursor: "pointer",
    marginRight: 12,
    fontSize: 16,
    color: green,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 15,
  },
  modal: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 8,
    minWidth: 280,
    maxWidth: 500,
    width: "90vw",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  modalTitle: {
    marginBottom: 15,
    color: green,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  inputModal: {
    marginTop: 6,
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 16,
    fontFamily: "inherit",
  },
  textareaModal: {
    marginTop: 6,
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 16,
    fontFamily: "inherit",
    resize: "vertical",
  },
};

export default CategoryPage;
