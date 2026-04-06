import { Star } from "lucide-react";

export default function StarRating({ rating, onRate, size = 20, readonly = false }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="star"
          onClick={() => !readonly && onRate?.(n)}
          style={{ cursor: readonly ? "default" : "pointer" }}
        >
          <Star
            size={size}
            fill={n <= rating ? "#F5A623" : "none"}
            color={n <= rating ? "#F5A623" : "#c4c4d0"}
          />
        </span>
      ))}
    </div>
  );
}
