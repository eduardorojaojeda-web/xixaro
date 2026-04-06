import { Link } from "react-router-dom";
import { Briefcase, Truck, Shield, TrendingUp, ArrowRight, Sprout } from "lucide-react";
import { LeafLogo } from "../components/Icons";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        {/* SVG Campo Mexicano */}
        <svg className="hero-scene" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          {/* Cielo amanecer */}
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8621A" stopOpacity="0.6" />
              <stop offset="30%" stopColor="#D4A843" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#4A7C1F" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2D5016" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="mountains" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D5016" />
              <stop offset="100%" stopColor="#1A1A0F" />
            </linearGradient>
            <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A7C1F" />
              <stop offset="100%" stopColor="#2D5016" />
            </linearGradient>
          </defs>
          {/* Cielo */}
          <rect width="1440" height="600" fill="url(#sky)" />
          {/* Sol */}
          <circle cx="720" cy="220" r="80" fill="#D4A843" opacity="0.35" />
          <circle cx="720" cy="220" r="50" fill="#E8621A" opacity="0.2" />
          {/* Montañas */}
          <path d="M0 350 L200 250 L400 310 L600 220 L750 280 L900 200 L1100 270 L1300 230 L1440 300 L1440 600 L0 600Z" fill="url(#mountains)" opacity="0.6" />
          <path d="M0 400 L150 340 L350 380 L500 320 L700 360 L850 300 L1050 350 L1200 310 L1440 370 L1440 600 L0 600Z" fill="url(#mountains)" opacity="0.4" />
          {/* Sembradíos */}
          <path d="M0 450 Q360 420 720 440 Q1080 460 1440 430 L1440 600 L0 600Z" fill="url(#field)" opacity="0.7" />
          {/* Líneas de sembradío */}
          <path d="M0 480 Q360 460 720 475 Q1080 490 1440 465" stroke="#6B9B3A" strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M0 500 Q360 485 720 495 Q1080 505 1440 490" stroke="#6B9B3A" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M0 520 Q360 510 720 515 Q1080 520 1440 510" stroke="#6B9B3A" strokeWidth="1" fill="none" opacity="0.25" />
        </svg>

        <div className="hero-overlay" />

        <div className="hero-content container">
          <div className="hero-logo">
            <LeafLogo size={40} />
            <span>Xixaro</span>
          </div>
          <h1 className="hero-title">
            Del surco a la empresa,
            <br />
            <span className="hero-accent">sin quien encarezca</span>
          </h1>
          <p className="hero-sub">
            Xixaro conecta productores agrícolas de México con restaurantes,
            supermercados, distribuidoras y exportadoras. Volúmenes comerciales,
            precios directos, sin intermediarios en la cadena.
          </p>
          <div className="hero-actions">
            <Link to="/registro" className="btn btn-hero-primary">
              <Sprout size={18} /> Soy Productor
            </Link>
            <Link to="/registro" className="btn btn-hero-outline">
              <Briefcase size={16} /> Soy Comprador Comercial
            </Link>
          </div>
        </div>

        {/* Wave bottom */}
        <svg className="hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0 30 C360 70 720 0 1080 50 C1260 70 1360 40 1440 30 L1440 80 L0 80Z" fill="var(--hueso)" />
        </svg>
      </section>

      <section className="features container">
        <div className="features-header">
          <span className="features-tag">La plataforma</span>
          <h2 className="section-title">Cadena de suministro sin eslabones de más</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Truck size={28} />
            </div>
            <h3>Volúmenes comerciales</h3>
            <p>Toneladas de producto directo del campo. Abasto constante para restaurantes, cadenas y distribuidoras.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">
              <Shield size={28} />
            </div>
            <h3>Productores verificados</h3>
            <p>Sistema de reseñas y calificaciones entre productores y compradores. Transacciones con confianza.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon gold">
              <TrendingUp size={28} />
            </div>
            <h3>Precio justo, sin inflación</h3>
            <p>Al eliminar intermediarios, el productor gana más y el comprador paga menos. Ambos ganan.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-inner container">
          <div className="cta-text">
            <h2>¿Produces y no llegas al mercado que mereces?</h2>
            <p>Registra tu producción y conecta directamente con compradores comerciales en todo México. Sin comisiones de arranque.</p>
          </div>
          <Link to="/registro" className="btn btn-orange btn-lg">
            Registrar mi Producción <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <LeafLogo size={22} />
            <span>Xixaro</span>
          </div>
          <p>Comercio agrícola directo. &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
