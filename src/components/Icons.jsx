// Iconos SVG personalizados para Xixaro
// Cada icono usa los colores de la marca: verde profundo, naranja cosecha, dorado

export function LeafLogo({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M8 28C8 28 6 18 14 12C22 6 28 4 28 4C28 4 26 14 18 20C10 26 8 28 8 28Z"
        fill="#4A7C1F"
      />
      <path
        d="M8 28C8 28 12 20 18 16"
        stroke="#2D5016"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 22C14 22 16 18 20 14"
        stroke="#2D5016"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function CornIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="16" rx="6" ry="12" fill="#D4A843" />
      <path d="M12 8C12 8 14 10 16 10C18 10 20 8 20 8" stroke="#E8621A" strokeWidth="1" opacity="0.6" />
      <path d="M11 12C11 12 14 14 16 14C18 14 21 12 21 12" stroke="#E8621A" strokeWidth="1" opacity="0.6" />
      <path d="M11 16C11 16 14 18 16 18C18 18 21 16 21 16" stroke="#E8621A" strokeWidth="1" opacity="0.6" />
      <path d="M12 20C12 20 14 22 16 22C18 22 20 20 20 20" stroke="#E8621A" strokeWidth="1" opacity="0.6" />
      <path d="M16 4L14 8M16 4L18 8" stroke="#4A7C1F" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 4L12 6" stroke="#4A7C1F" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M16 4L20 6" stroke="#4A7C1F" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function ChileIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M14 6C14 6 12 4 14 2C14 2 16 4 16 6"
        stroke="#4A7C1F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 6C13 8 10 12 10 18C10 24 14 28 16 28C16 28 14 22 16 16C18 10 15 6 15 6Z"
        fill="#E8621A"
      />
      <path
        d="M15 6C17 8 20 12 19 18C18 24 16 28 16 28"
        stroke="#cf5515"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

export function BasketIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M6 14H26L24 26H8L6 14Z" fill="#D4A843" opacity="0.2" stroke="#D4A843" strokeWidth="1.5" />
      <path d="M6 14L10 8H22L26 14" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14V24" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <path d="M16 14V24" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <path d="M20 14V24" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function FieldIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="8" r="5" fill="#E8621A" opacity="0.3" />
      <circle cx="16" cy="8" r="3" fill="#D4A843" opacity="0.5" />
      <path d="M2 20Q8 17 16 18Q24 19 30 16" stroke="#4A7C1F" strokeWidth="1.5" fill="none" />
      <path d="M2 24Q8 21 16 22Q24 23 30 20" stroke="#4A7C1F" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M2 28Q8 25 16 26Q24 27 30 24" stroke="#4A7C1F" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

export function WeightIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="10" r="4" stroke="#2D5016" strokeWidth="1.5" fill="none" />
      <path d="M8 28L10 16H22L24 28H8Z" fill="#4A7C1F" opacity="0.15" stroke="#2D5016" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="16" y="24" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#2D5016">KG</text>
    </svg>
  );
}

export function CameraIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="10" width="24" height="16" rx="3" stroke="#2D5016" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="18" r="5" stroke="#E8621A" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="18" r="2" fill="#E8621A" opacity="0.3" />
      <path d="M11 10L13 6H19L21 10" stroke="#2D5016" strokeWidth="1.5" />
    </svg>
  );
}

export function LostPageIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="12" y="4" width="40" height="52" rx="4" stroke="#2D5016" strokeWidth="2" fill="#F5F0E8" />
      <path d="M22 20H42" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 28H38" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M22 34H34" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="44" cy="44" r="14" fill="#FAFAF7" stroke="#E8621A" strokeWidth="2" />
      <text x="44" y="49" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#E8621A">?</text>
    </svg>
  );
}

export function ProductPlaceholder({ size = 64, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect width="64" height="64" rx="8" fill="#f2f7ec" />
      <path d="M20 44C20 44 24 30 32 28C40 26 44 36 44 36" stroke="#4A7C1F" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <circle cx="32" cy="22" r="6" fill="#D4A843" opacity="0.3" />
      <path d="M30 20L32 14L34 20" stroke="#4A7C1F" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function ChileLargeIcon({ size = 80, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Fondo circular suave */}
      <circle cx="40" cy="40" r="38" fill="#f2f7ec" />
      <circle cx="40" cy="40" r="38" stroke="#e6f0db" strokeWidth="1" />

      {/* Tallo principal */}
      <path
        d="M38 28C38 22 34 18 30 16"
        stroke="#2D5016"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tallo secundario */}
      <path
        d="M38 26C40 20 44 17 47 16"
        stroke="#4A7C1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hojita */}
      <path
        d="M32 19C32 19 29 17 30 14C30 14 34 15 32 19Z"
        fill="#4A7C1F"
      />

      {/* Cuerpo del chile */}
      <path
        d="M36 30C34 30 30 34 28 40C26 46 26 52 28 56C30 60 34 62 38 62C40 62 42 60 43 56C44 52 44 46 42 40C40 34 38 30 36 30Z"
        fill="#E8621A"
      />
      {/* Sombra para volumen */}
      <path
        d="M34 34C33 36 31 42 30 48C29 52 30 56 31 58"
        stroke="#cf5515"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      {/* Reflejo de luz */}
      <path
        d="M33 36C32 40 31 46 31 50"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />

      {/* Punta curvada */}
      <path
        d="M38 62C37 64 35 66 34 66"
        stroke="#E8621A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Corona verde */}
      <path
        d="M33 30C33 28 35 27 37 27C39 27 41 28 41 30C41 32 39 32 37 32C35 32 33 32 33 30Z"
        fill="#2D5016"
      />
      <path
        d="M35 28C35 27 36 26 37 26C38 26 39 27 39 28"
        stroke="#4A7C1F"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  );
}
