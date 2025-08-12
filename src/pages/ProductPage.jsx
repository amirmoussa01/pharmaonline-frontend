// ProductPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  faEye,
  faPen,
  faTrash,
  faPlus,
  faTimes,
  faSortAmountDown,
  faSortAmountUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/produits`;
const API_CATEGORIES = `${import.meta.env.VITE_API_URL}/api/categories`;

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortPrice, setSortPrice] = useState(null); // 'asc' | 'desc' | null

  const [modalType, setModalType] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    quantite: "",
    categorie_id: "",
    image: null,
  });

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  };

  const searchTimeout = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let gridColumns = 4;
  if (windowWidth < 600) gridColumns = 1;
  else if (windowWidth < 900) gridColumns = 2;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts();
    }, 400);
  }, [searchTerm, filterCategory, sortPrice]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_CATEGORIES);
      setCategories(res.data);
      if (!filterCategory && res.data.length > 0) {
        setFilterCategory("");
      }
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `${API_BASE}`;
      const params = new URLSearchParams();
      if (searchTerm.trim() !== "") params.append("q", searchTerm.trim());
      if (filterCategory !== "" && filterCategory !== "all")
        params.append("categorie_id", filterCategory);
      if (sortPrice) params.append("sort", sortPrice);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const res = await axios.get(url);
      setProducts(res.data);
    } catch {
      toast.error("Erreur de chargement des produits");
    }
  };

  const openModal = (type, product = null) => {
    setModalType(type);
    setCurrentProduct(product);
    if (product) {
      setForm({
        nom: product.nom || "",
        description: product.description || "",
        prix: product.prix || "",
        quantite: product.quantite || "",
        categorie_id: product.categorie_id || "",
        image: null,
      });
    } else {
      setForm({
        nom: "",
        description: "",
        prix: "",
        quantite: "",
        categorie_id: categories.length > 0 ? categories[0].id : "",
        image: null,
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentProduct(null);
    setForm({
      nom: "",
      description: "",
      prix: "",
      quantite: "",
      categorie_id: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nom", form.nom);
      formData.append("description", form.description);
      formData.append("prix", form.prix);
      formData.append("quantite", form.quantite);
      formData.append("categorie_id", form.categorie_id);
      if (form.image) formData.append("image", form.image);

      if (modalType === "add") {
        await axios.post(API_BASE, formData, config);
        toast.success("Produit ajouté");
      } else if (modalType === "edit" && currentProduct) {
        await axios.put(`${API_BASE}/${currentProduct.id}`, formData, config);
        toast.success("Produit modifié");
      }

      closeModal();
      fetchProducts();
    } catch {
      toast.error("Désolé !! Acces non autorisé");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${currentProduct.id}`, config);
      toast.success("Produit supprimé");
      closeModal();
      fetchProducts();
    } catch {
      toast.error("Désolé !! Acces non autorisé");
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.nom : "—";
  };

  const toggleSortPrice = () => {
    if (sortPrice === "asc") setSortPrice("desc");
    else if (sortPrice === "desc") setSortPrice(null);
    else setSortPrice("asc");
  };

  const green = "#2e7d32";

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestion des Produits</h2>

      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>

        <button
          onClick={toggleSortPrice}
          style={styles.sortButton}
          title="Trier par prix"
        >
          Prix
          {sortPrice === "asc" && (
            <FontAwesomeIcon
              icon={faSortAmountDown}
              style={{ marginLeft: 5 }}
            />
          )}
          {sortPrice === "desc" && (
            <FontAwesomeIcon icon={faSortAmountUp} style={{ marginLeft: 5 }} />
          )}
          {!sortPrice && (
            <FontAwesomeIcon
              icon={faSortAmountDown}
              style={{ marginLeft: 5, opacity: 0.3 }}
            />
          )}
        </button>

        <button onClick={() => openModal("add")} style={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Ajouter
        </button>
      </div>

      <div
        style={{
          ...styles.cardsContainer,
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        }}
      >
        {products.length === 0 && (
          <div style={{ textAlign: "center", width: "100%" }}>
            Chargement des produits en cours...
          </div>
        )}

        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            {product.image && (
              <img
                src={`${import.meta.env.VITE_API_URL}${product.image}`}
                alt={product.nom}
                style={styles.cardImage}
              />
            )}
            <div style={styles.cardBody}>
              <h4 style={styles.cardTitle}>{product.nom}</h4>
              <div style={styles.compactText}>
                {product.description || "-"}
                <br />
                <strong>Catégorie:</strong> {getCategoryName(product.categorie_id)}
                <br />
                <strong>Prix:</strong> {product.prix} FCFA
                <br />
                <strong>Quantité:</strong> {product.quantite}
              </div>

              <div style={styles.cardActions}>
                <FontAwesomeIcon
                  icon={faEye}
                  style={styles.icon}
                  title="Voir"
                  onClick={() => openModal("view", product)}
                />
                <FontAwesomeIcon
                  icon={faPen}
                  style={styles.icon}
                  title="Modifier"
                  onClick={() => openModal("edit", product)}
                />
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ ...styles.icon, color: "#d32f2f" }}
                  title="Supprimer"
                  onClick={() => openModal("delete", product)}
                />
              </div>
            </div>
          </div>
        ))}
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
                  {modalType === "add" ? "Ajouter" : "Modifier"} un produit
                </h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <label style={styles.label}>
                    Nom *
                    <input
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      style={styles.inputModal}
                    />
                  </label>
                  <label style={styles.label}>
                    Description
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      style={styles.textareaModal}
                    />
                  </label>
                  <label style={styles.label}>
                    Prix (FCFA) *
                    <input
                      type="number"
                      name="prix"
                      min="0"
                      step="any"
                      value={form.prix}
                      onChange={handleChange}
                      required
                      style={styles.inputModal}
                    />
                  </label>
                  <label style={styles.label}>
                    Quantité *
                    <input
                      type="number"
                      name="quantite"
                      min="0"
                      value={form.quantite}
                      onChange={handleChange}
                      required
                      style={styles.inputModal}
                    />
                  </label>
                  <label style={styles.label}>
                    Catégorie *
                    <select
                      name="categorie_id"
                      value={form.categorie_id}
                      onChange={handleChange}
                      required
                      style={styles.inputModal}
                    >
                      <option value="">-- Sélectionner une catégorie --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={styles.label}>
                    Image Produit {modalType === "edit" ? "(laisser vide pour garder l'actuelle)" : ""}
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      style={styles.inputModal}
                    />
                  </label>

                  <button type="submit" style={styles.addButton}>
                    Enregistrer
                  </button>
                </form>
              </>
            )}

            {modalType === "view" && currentProduct && (
              <>
                <h3 style={styles.modalTitle}>Détails du produit</h3>
                {currentProduct.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${currentProduct.image}`}
                    alt={currentProduct.nom}
                    style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 15 }}
                  />
                )}
                <div style={styles.compactText}>
                  <strong>Nom :</strong> {currentProduct.nom}
                  <br />
                  <strong>Description :</strong> {currentProduct.description || "—"}
                  <br />
                  <strong>Catégorie :</strong> {getCategoryName(currentProduct.categorie_id)}
                  <br />
                  <strong>Prix :</strong> {currentProduct.prix} FCFA
                  <br />
                  <strong>Quantité :</strong> {currentProduct.quantite}
                </div>
              </>
            )}

            {modalType === "delete" && currentProduct && (
              <>
                <h3 style={styles.modalTitle}>Confirmation</h3>
                <div>
                  Voulez-vous vraiment supprimer le produit{" "}
                  <strong>{currentProduct.nom}</strong> ?
                </div>
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

const styles = {
  container: {
    maxWidth: 1100,
    margin: "auto",
    padding: 20,
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    color: "#2e7d32",
    marginBottom: 10,
  },
  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    flexGrow: 1,
    minWidth: 180,
    fontSize: 14,
  },
  select: {
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    minWidth: 180,
    fontSize: 14,
  },
  sortButton: {
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: 5,
    border: "1px solid #2e7d32",
    backgroundColor: "white",
    color: "#2e7d32",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 14,
  },
  addButton: {
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#2e7d32",
    color: "white",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 14,
  },
  cardsContainer: {
    display: "grid",
    gap: 10,
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    fontSize: 13,
  },
  cardImage: {
    width: "100%",
    height: 90,
    objectFit: "cover",
  },
  cardBody: {
    padding: 10,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    margin: "0 0 4px 0",
    color: "#2e7d32",
    fontSize: 15,
  },
  compactText: {
    lineHeight: 1.2,
    color: "#444",
    marginBottom: 6,
    whiteSpace: "pre-line",
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  icon: {
    cursor: "pointer",
    fontSize: 16,
    color: "#2e7d32",
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
    padding: 20,
    borderRadius: 8,
    minWidth: 280,
    maxWidth: 450,
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
    color: "#2e7d32",
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
    gap: 12,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  inputModal: {
    marginTop: 6,
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
    fontFamily: "inherit",
  },
  textareaModal: {
    marginTop: 6,
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: 5,
    marginTop: 10,
    cursor: "pointer",
    fontSize: 14,
  },
};

export default ProductPage;
