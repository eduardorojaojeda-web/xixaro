import { Link } from "react-router-dom";
import {
  ArrowRight, TrendingUp, Shield, Truck, Users, Package, MapPin,
  MessageCircle, Bell, Star, ShoppingCart, CheckCircle, Sprout,
  Building2, BarChart3, Lock, Globe, Zap,
} from "lucide-react";
import { LeafLogo } from "../components/Icons";
import "./Pitch.css";

const metrics = [
  { value: "$2.1T", label: "Mercado agrícola en Latinoamérica", sub: "Oportunidad de mercado" },
  { value: "40%", label: "Se pierde en intermediarios", sub: "Problema que resolvemos" },
  { value: "5.4M", label: "Productores agrícolas en México", sub: "Mercado objetivo" },
  { value: "0%", label: "Comisión de arranque", sub: "Modelo de entrada" },
];

const features = [
  { icon: <Package size={24} />, title: "Marketplace B2B", desc: "Catálogo de productos agrícolas por tonelada con precios transparentes y equivalencias en kg y libra." },
  { icon: <ShoppingCart size={24} />, title: "Pedidos formales", desc: "Sistema completo: cantidad, fecha de entrega, seguimiento en 4 etapas y control de inventario automático." },
  { icon: <MapPin size={24} />, title: "Geolocalización", desc: "Mapa interactivo con filtro por distancia. Encuentra productores a 5, 10 o 25 km de tu negocio." },
  { icon: <MessageCircle size={24} />, title: "Chat directo", desc: "Comunicación en tiempo real entre productor y comprador con notificaciones push." },
  { icon: <Shield size={24} />, title: "Verificación de identidad", desc: "Los productores suben su INE y un admin verifica su identidad antes de poder publicar." },
  { icon: <Star size={24} />, title: "Reseñas y reputación", desc: "Sistema de calificación 1-5 estrellas bidireccional. La confianza se construye con transparencia." },
  { icon: <Bell size={24} />, title: "Alertas inteligentes", desc: "Los compradores eligen categorías de interés y reciben notificación cuando hay producto nuevo." },
  { icon: <BarChart3 size={24} />, title: "Precios de mercado", desc: "El vendedor ve el precio promedio en la plataforma al publicar. Información para decisiones justas." },
  { icon: <Lock size={24} />, title: "Panel de administrador", desc: "Moderación de productos, gestión de usuarios, verificación de identidad y resolución de disputas." },
  { icon: <TrendingUp size={24} />, title: "Control de inventario", desc: "El stock se actualiza automáticamente al confirmar pedidos. Badge de 'Agotado' cuando llega a cero." },
  { icon: <Users size={24} />, title: "Sistema de disputas", desc: "Comprador o vendedor puede abrir disputa. El admin resuelve con transparencia y registro permanente." },
  { icon: <Globe size={24} />, title: "Sin infraestructura", desc: "100% web, sin apps nativas. Funciona en cualquier navegador, celular o computadora." },
];

const sellerBenefits = [
  "Vende directo a restaurantes, supermercados y distribuidoras",
  "Elimina al intermediario que se queda con tu margen",
  "Precio justo por tonelada con visibilidad de mercado",
  "Construye reputación verificable con reseñas reales",
  "Recibe pedidos formales con cantidad y fecha de entrega",
  "Geolocalización para que compradores cercanos te encuentren",
];

const buyerBenefits = [
  "Accede a producto fresco directo del campo",
  "Precios más bajos al eliminar la cadena de intermediarios",
  "Volúmenes comerciales reales: toneladas, no kilos",
  "Seguimiento de pedidos en tiempo real en 4 etapas",
  "Alertas cuando hay producto nuevo en tu categoría",
  "Chat directo con el productor para negociar condiciones",
];

export default function Pitch() {
  return (
    <div className="pitch-page">
      {/* Hero */}
      <section className="pitch-hero">
        <div className="container">
          <div className="pitch-hero-badge">Plataforma B2B</div>
          <div className="pitch-logo">
            <LeafLogo size={48} />
            <span>Xixaro</span>
          </div>
          <h1>
            La infraestructura digital para el
            <br />
            <span className="pitch-accent">comercio agrícola en México</span>
          </h1>
          <p className="pitch-hero-sub">
            Conectamos productores agrícolas directamente con restaurantes, supermercados,
            distribuidoras y exportadoras. Sin intermediarios, sin opacidad, sin márgenes
            injustos.
          </p>
          <div className="pitch-hero-actions">
            <Link to="/registro" className="btn btn-pitch-primary">
              <Sprout size={18} /> Soy Productor <ArrowRight size={16} />
            </Link>
            <Link to="/registro" className="btn btn-pitch-secondary">
              <Building2 size={18} /> Soy Comprador
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="pitch-section pitch-problem">
        <div className="container">
          <div className="pitch-section-header">
            <span className="pitch-tag">El problema</span>
            <h2>La cadena de suministro agrícola en México está rota</h2>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <span className="problem-num">01</span>
              <h3>El productor vende barato</h3>
              <p>Los coyotes e intermediarios compran la cosecha a precios mínimos. El agricultor que siembra, riega y cosecha es quien menos gana.</p>
            </div>
            <div className="problem-card">
              <span className="problem-num">02</span>
              <h3>El comprador paga caro</h3>
              <p>Cada eslabón de la cadena agrega su margen. Un chile que sale del campo a $8/kg llega al restaurante a $25/kg.</p>
            </div>
            <div className="problem-card">
              <span className="problem-num">03</span>
              <h3>No hay visibilidad</h3>
              <p>Los productores no saben quién necesita su producto. Los compradores no saben quién lo tiene. No hay un punto de encuentro eficiente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="pitch-section pitch-solution">
        <div className="container">
          <div className="pitch-section-header">
            <span className="pitch-tag">La solución</span>
            <h2>Xixaro elimina los eslabones que no agregan valor</h2>
            <p className="pitch-section-sub">
              Una plataforma donde el productor publica su cosecha y el comprador comercial
              la encuentra, negocia y pide directamente. Transparencia total.
            </p>
          </div>
          <div className="solution-flow">
            <div className="flow-step">
              <div className="flow-icon"><Sprout size={28} /></div>
              <h4>Productor</h4>
              <p>Publica su producción con precio, cantidad y ubicación</p>
            </div>
            <div className="flow-arrow"><ArrowRight size={24} /></div>
            <div className="flow-step flow-center">
              <div className="flow-icon xixaro-icon"><LeafLogo size={32} /></div>
              <h4>Xixaro</h4>
              <p>Conecta, verifica, facilita la transacción</p>
            </div>
            <div className="flow-arrow"><ArrowRight size={24} /></div>
            <div className="flow-step">
              <div className="flow-icon buyer-icon"><Building2 size={28} /></div>
              <h4>Comprador</h4>
              <p>Encuentra, pide y recibe producto directo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="pitch-metrics">
        <div className="container">
          <div className="metrics-grid">
            {metrics.map((m) => (
              <div key={m.label} className="metric-card">
                <span className="metric-sub">{m.sub}</span>
                <span className="metric-value">{m.value}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pitch-section">
        <div className="container">
          <div className="pitch-section-header">
            <span className="pitch-tag">Funcionalidades</span>
            <h2>Todo lo que necesita un marketplace agrícola profesional</h2>
            <p className="pitch-section-sub">
              12 módulos integrados construidos para las necesidades reales del comercio
              agrícola en México.
            </p>
          </div>
          <div className="features-grid-pitch">
            {features.map((f) => (
              <div key={f.title} className="feature-pitch-card">
                <div className="fp-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pitch-section pitch-benefits">
        <div className="container">
          <div className="pitch-section-header">
            <span className="pitch-tag">Beneficios</span>
            <h2>Valor para ambos lados de la cadena</h2>
          </div>
          <div className="benefits-grid">
            <div className="benefit-col seller-col">
              <div className="benefit-header">
                <Sprout size={24} />
                <h3>Para Productores</h3>
              </div>
              <ul>
                {sellerBenefits.map((b) => (
                  <li key={b}><CheckCircle size={16} /> {b}</li>
                ))}
              </ul>
            </div>
            <div className="benefit-col buyer-col">
              <div className="benefit-header">
                <Building2 size={24} />
                <h3>Para Compradores</h3>
              </div>
              <ul>
                {buyerBenefits.map((b) => (
                  <li key={b}><CheckCircle size={16} /> {b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="pitch-section pitch-tech">
        <div className="container">
          <div className="pitch-section-header">
            <span className="pitch-tag">Tecnología</span>
            <h2>Construido con la infraestructura más robusta</h2>
          </div>
          <div className="tech-grid">
            <div className="tech-item"><Zap size={20} /> <strong>React 19</strong> — Interfaz rápida y responsiva</div>
            <div className="tech-item"><Zap size={20} /> <strong>Firebase</strong> — Auth, Firestore, Realtime DB</div>
            <div className="tech-item"><Zap size={20} /> <strong>Leaflet</strong> — Mapas interactivos OpenStreetMap</div>
            <div className="tech-item"><Zap size={20} /> <strong>Vite</strong> — Build optimizado en &lt;300ms</div>
            <div className="tech-item"><Zap size={20} /> <strong>Netlify</strong> — Deploy global con CDN</div>
            <div className="tech-item"><Zap size={20} /> <strong>LFPDPPP</strong> — Cumplimiento de datos personales</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pitch-cta">
        <div className="container">
          <LeafLogo size={56} />
          <h2>El campo mexicano merece una mejor forma de comerciar</h2>
          <p>
            Xixaro ya está listo. Regístrate hoy como productor o comprador
            comercial y sé parte de la transformación del comercio agrícola
            en México.
          </p>
          <div className="pitch-cta-actions">
            <Link to="/registro" className="btn btn-pitch-primary btn-lg">
              Crear Cuenta Gratis <ArrowRight size={18} />
            </Link>
            <Link to="/como-funciona" className="btn btn-pitch-outline btn-lg">
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
