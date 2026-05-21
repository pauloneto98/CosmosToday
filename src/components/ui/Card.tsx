"use client";

import { forwardRef, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", glass = true, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          relative
          ${glass ? "glass" : "bg-[var(--color-surface)]"}
          ${hover ? "card-hover" : ""}
          p-6
          overflow-hidden
          noise-overlay
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };