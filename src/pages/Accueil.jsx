import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import { motion } from 'framer-motion';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Accueil.css';

const Accueil = () => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  const images = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg'];

  const produits = [
    { nom: "Doliprane 1000mg", image: "/doliprane.jpg", description: "Soulage la douleur et fait baisser la fièvre." },
    { nom: "Gel Hydroalcoolique", image: "/gel.jpg", description: "Nettoie et désinfecte sans rinçage." },
    { nom: "Vitamines C Boost", image: "/boost.jpg", description: "Renforce votre système immunitaire." },
    { nom: "Pansements Steriles", image: "/pansement.jpg", description: "Protection et cicatrisation rapide." },
    { nom: "Thermomètre médical", image: "/thermometre.jpg", description: "Mesure précise de la température corporelle." },
    { nom: "Sirop Toux Sèche", image: "/toux.jpg", description: "Apaise les toux irritantes rapidement." },
    { nom: "Spray Nasal Isotonique", image: "/spray.jpg", description: "Décongestionne le nez en douceur." },
    { nom: "Crème Arnica", image: "/creme.jpg", description: "Soulage les douleurs musculaires et les bleus." },
    { nom: "Paracetamol", image: "/paracetamol.jpg", description: "Soulage les maux de tête." },
    { nom: "Litacold", image: "/litacold.jpg", description: "Comprimés pour la grippe et le rhume." }
  ];

  const redirigerVersProduits = () => {
    navigate('/login');
  };

  return (
    <motion.div
      className="accueil-container"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.2
          }
        }
      }}
    >
      {/* Bandeau */}
      <motion.header className="accueil-header" variants={{ hidden: { y: -20, opacity: 0 }, visible: { y: 2, opacity: 1 } }}>
        <h1>PharmaOnline</h1>
        <p>Votre pharmacie en ligne de confiance 💊</p>
      </motion.header>

      {/* Section principale */}
      <motion.main className="accueil-main">
        {/* Texte */}
        <motion.div
          className="accueil-text"
          variants={{ hidden: { x: -40, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
        >
          <h2>Achetez vos médicaments en ligne en toute simplicité</h2>
          <p>
            PharmaOnline vous propose une large gamme de produits pharmaceutiques à des prix compétitifs.
            Passez vos commandes depuis chez vous, recevez-les rapidement et en toute sécurité.
          </p>
          <div className="accueil-buttons">
            <Link to="/login"><button className="btn btn-primary">Se connecter</button></Link>
            <Link to="/register"><button className="btn btn-outline">S'inscrire</button></Link>
          </div>
        </motion.div>

        {/* Carrousel */}
        <motion.div
          className="accueil-carousel"
          variants={{ hidden: { x: 40, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
        >
          <Slider {...settings}>
            {images.map((src, i) => (
              <div key={i}>
                <img src={src} alt={`slide-${i}`} className="carousel-image" />
              </div>
            ))}
          </Slider>
        </motion.div>
      </motion.main>

      {/* Produits Populaires */}
      <section className="produits-section">
        <h2>Produits Populaires</h2>
        <div className="produits-grid">
          {produits.map((prod, i) => (
            <motion.div
              key={i}
              className="produit-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <img src={prod.image} alt={prod.nom} />
              <h3>{prod.nom}</h3>
              <p>{prod.description}</p>
              <button onClick={redirigerVersProduits}>Commander</button>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Accueil;
