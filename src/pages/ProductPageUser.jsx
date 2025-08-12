import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  faEye,
  faPlus,
  faTimes,
  faSortAmountDown,
  faSortAmountUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/produits`;
const API_CATEGORIES = `${import.meta.env.VITE_API_URL}/api/categories`;

const ProductPageUser = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortPrice, setSortPrice] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const searchTimeout = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

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
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `${API_BASE}`;
      const params = new URLSearchParams();
      if (searchTerm.trim() !== "") params.append("q", searchTerm.trim());
      if (filterCategory && filterCategory !== "all")
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
    setQuantity(1);
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentProduct(null);
    setQuantity(1);
  };

  const handleCommander = async () => {
    if (quantity <= 0) return toast.error("Quantité invalide");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour commander.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/commandes/commander`,
        { id_produit: currentProduct.id, quantite: quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Produit commandé !");
      closeModal();

      // ✅ Redirection après succès
      setTimeout(() => navigate("/mes-commandes"), 1000);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.info("Ce produit est déjà dans votre commande.");
      } else {
        toast.error("Erreur lors de la commande");
        console.error(err);
      }
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Nos Produits</h2>

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

        <button onClick={toggleSortPrice} style={styles.sortButton}>
          Prix
          {sortPrice === "asc" && (
            <FontAwesomeIcon icon={faSortAmountDown} style={{ marginLeft: 5 }} />
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
      </div>

      <div
        style={{
          ...styles.cardsContainer,
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        }}
      >
        {products.length === 0 && (
          <div style={{ textAlign: "center", width: "100%" }}>
            Chargement des produits...
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
              </div>

              <div style={styles.cardActions}>
                <FontAwesomeIcon
                  icon={faEye}
                  style={styles.icon}
                  title="Voir"
                  onClick={() => openModal("view", product)}
                />
                <button
                  onClick={() => openModal("commander", product)}
                  style={styles.commanderButton}
                  title="Commander"
                >
                  Commander
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal commande */}
      {modalType === "view" && currentProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button onClick={closeModal} style={styles.closeBtn}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
              <h3 style={styles.modalTitle}>Détails du produit</h3>
              {currentProduct.image && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${currentProduct.image}`}
                  alt={currentProduct.nom}
                  style={{ maxWidth: "100%",maxHeight:"250px", borderRadius: 8, marginBottom: 15 }}
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
          </div>
        </div>
      )}
      {modalType === "commander" && currentProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button onClick={closeModal} style={styles.closeBtn}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 style={styles.modalTitle}>Commander : {currentProduct.nom}</h3>
            <p>
              Prix unitaire : {currentProduct.prix} FCFA <br />
              Quantité :
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{
                  width: 60,
                  marginLeft: 8,
                  padding: 5,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
            </p>
            <button
              style={{
                backgroundColor: "#2e7d32",
                color: "white",
                padding: "8px 15px",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                marginTop: 10,
              }}
              onClick={handleCommander}
            >
              Valider la commande
            </button>
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  icon: {
    cursor: "pointer",
    fontSize: 16,
    color: "#2e7d32",
  },
  commanderButton: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
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
};

export default ProductPageUser;
