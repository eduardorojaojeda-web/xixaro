import { Link } from "react-router-dom";
import { MessageCircle, User } from "lucide-react";
import { ProductPlaceholder } from "./Icons";
import "./ProductCard.css";

export default function ProductCard({ product, onContact }) {
  return (
    <div className="product-card card">
      <div className="product-img-wrap">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-img" />
        ) : (
          <div className="product-img-placeholder"><ProductPlaceholder size={72} /></div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-pricing">
          <span className="product-price">
            ${Number(product.price).toLocaleString("es-MX")} <small>/ tonelada</small>
          </span>
          <div className="product-equiv">
            <span>= ${(product.price / 1000).toFixed(2)} por kg</span>
            <span>= ${(product.price / 2204.62).toFixed(2)} por lb</span>
          </div>
        </div>
        <div className="product-meta">
          <span className="product-qty">
            {product.quantity} {product.unit}{Number(product.quantity) !== 1 && "s"} disponible{Number(product.quantity) !== 1 && "s"}
          </span>
        </div>
        <Link to={`/perfil/${product.sellerId}`} className="product-seller">
          <User size={14} />
          {product.sellerName}
        </Link>
        <div className="product-actions">
          <Link to={`/perfil/${product.sellerId}`} className="btn btn-sm btn-outline">
            Ver Vendedor
          </Link>
          {onContact && (
            <button className="btn btn-sm btn-primary" onClick={() => onContact(product)}>
              <MessageCircle size={14} /> Contactar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
