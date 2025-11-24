import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, disabled }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          className={`transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => onRate(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
        >
          <Star
            size={20}
            fill={(hover || rating) >= star ? "#fbbf24" : "transparent"} // Amber 400
            className={(hover || rating) >= star ? "text-amber-400" : "text-slate-600"}
          />
        </button>
      ))}
    </div>
  );
};
