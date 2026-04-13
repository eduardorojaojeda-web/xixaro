import { Link } from "react-router-dom";
import {
  UserPlus, Package, Search, ShoppingCart, CheckCircle, Truck,
  Star, Bell, ArrowRight, Sprout, Building2, MessageCircle,
} from "lucide-react";
import "./HowItWorks.css";

const sellerSteps = [
  {
    num: "01",
    icon: <UserPlus size={28} />,
    title: "Crea tu cuenta como Productor",
    desc: "Regístrate con tu correo, selecciona el rol de Productor / Agricultor y completa tu perfil con tu información comercial.",
  },
  {
    num: "02",
    icon: <Package size={28} />,
    title: "Publica tu producción",
    desc: "Agrega tus productos con nombre, precio por tonelada, cantidad disponible, fotos y ubicación. Tu producto entra a revisión antes de publicarse.",
  },
  {
    num: "03",
    icon: <Bell size={28} />,
    title: "Recibe pedidos",
    desc: "Los compradores comerciales ven tu producto en el marketplace y te envían pedidos formales con cantidad, fecha de entrega y notas.",
  },
  {
    num: "04",
    icon: <CheckCircle size={28} />,
    title: "Confirma y envía",
    desc: "Revisa el pedido, confírmalo y actualiza el estado: confirmado, en camino, entregado. El comprador ve el seguimiento en tiempo real.",
  },
  {
    num: "05",
    icon: <Star size={28} />,
    title: "Construye tu reputación",
    desc: "Los compradores te califican después de cada transacción. Una buena reputación atrae más pedidos y mejores clientes.",
  },
];

const buyerSteps = [
  {
    num: "01",
    icon: <UserPlus size={28} />,
    title: "Crea tu cuenta como Comprador",
    desc: "Regístrate como Comprador Comercial. Indica si eres restaurante, supermercado, distribuidora o exportadora.",
  },
  {
    num: "02",
    icon: <Search size={28} />,
    title: "Explora el marketplace",
    desc: "Busca productos por nombre, categoría o ubicación. Usa el mapa para encontrar productores cerca de ti. Filtra por precio y distancia.",
  },
  {
    num: "03",
    icon: <ShoppingCart size={28} />,
    title: "Haz un pedido formal",
    desc: "Selecciona el producto, indica la cantidad en toneladas, la fecha de entrega deseada y cualquier especificación de calidad o empaque.",
  },
  {
    num: "04",
    icon: <MessageCircle size={28} />,
    title: "Comunícate directo",
    desc: "Usa el chat interno para negociar detalles, coordinar logística o hacer preguntas al productor antes o después del pedido.",
  },
  {
    num: "05",
    icon: <Truck size={28} />,
    title: "Recibe y califica",
    desc: "Sigue el estado de tu pedido en tiempo real. Al recibir tu producto, califica al productor para ayudar a la comunidad.",
  },
];

export default function HowItWorks() {
  return (
    <div className="hiw-page">
      <section className="hiw-hero">
        <div className="container">
          <h1>¿Cómo funciona Xixaro?</h1>
          <p>
            Conectamos productores agrícolas con compradores comerciales en
            5 pasos simples. Sin intermediarios, sin complicaciones.
          </p>
        </div>
      </section>

      <section className="hiw-section container">
        <div className="hiw-section-header">
          <div className="hiw-role-icon seller"><Sprout size={32} /></div>
          <div>
            <h2>Para Productores</h2>
            <p>Lleva tu cosecha directamente a restaurantes, supermercados y distribuidoras</p>
          </div>
        </div>
        <div className="hiw-steps">
          {sellerSteps.map((step) => (
            <div key={step.num} className="hiw-step">
              <div className="hiw-step-num">{step.num}</div>
              <div className="hiw-step-icon seller">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="hiw-cta-inline">
          <Link to="/registro" className="btn btn-primary">
            <Sprout size={16} /> Registrarme como Productor <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div className="hiw-divider">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 Q360 60 720 30 Q1080 0 1440 30 L1440 60 L0 60Z" fill="var(--hueso)" />
        </svg>
      </div>

      <section className="hiw-section hiw-buyer-bg container">
        <div className="hiw-section-header">
          <div className="hiw-role-icon buyer"><Building2 size={32} /></div>
          <div>
            <h2>Para Compradores Comerciales</h2>
            <p>Accede a producto fresco del campo a precios directos y volúmenes reales</p>
          </div>
        </div>
        <div className="hiw-steps">
          {buyerSteps.map((step) => (
            <div key={step.num} className="hiw-step">
              <div className="hiw-step-num">{step.num}</div>
              <div className="hiw-step-icon buyer">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="hiw-cta-inline">
          <Link to="/registro" className="btn btn-orange">
            <Building2 size={16} /> Registrarme como Comprador <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="hiw-faq container">
        <h2>Preguntas frecuentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>¿Xixaro cobra comisión por transacción?</h4>
            <p>No. Actualmente la plataforma es gratuita para productores y compradores. Más adelante se podrán integrar servicios de pago opcionales.</p>
          </div>
          <div className="faq-item">
            <h4>¿Qué tipo de productos puedo vender?</h4>
            <p>Productos agrícolas: verduras, chiles, frutas, granos y otros productos del campo mexicano. Todos los productos pasan por moderación antes de publicarse.</p>
          </div>
          <div className="faq-item">
            <h4>¿Cómo se manejan los pagos?</h4>
            <p>Actualmente los pagos se acuerdan directamente entre productor y comprador. Próximamente se integrará Conekta como procesador de pagos seguro.</p>
          </div>
          <div className="faq-item">
            <h4>¿Puedo ver productos cerca de mi ubicación?</h4>
            <p>Sí. El marketplace tiene vista de mapa y filtro por distancia (5km, 10km, 25km) usando tu ubicación actual.</p>
          </div>
          <div className="faq-item">
            <h4>¿Los productos son revisados antes de publicarse?</h4>
            <p>Sí. Un administrador revisa cada producto nuevo antes de que aparezca en el marketplace para garantizar la calidad de la plataforma.</p>
          </div>
          <div className="faq-item">
            <h4>¿Cómo contacto a un productor?</h4>
            <p>Puedes enviarle un mensaje directo desde su producto o perfil usando el chat interno de Xixaro. También puedes hacer un pedido formal directamente.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
