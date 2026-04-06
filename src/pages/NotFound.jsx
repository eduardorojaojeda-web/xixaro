import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { LostPageIcon } from "../components/Icons";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <LostPageIcon size={80} />
      <h1>404</h1>
      <p>Esta página no existe o fue movida.</p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} /> Ir al Inicio
      </Link>
    </div>
  );
}
