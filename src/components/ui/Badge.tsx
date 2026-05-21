"use client";

import { forwardRef, HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "danger" | "warning";
  pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", pulse = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 text-[var(--color-text-muted)]",
      primary: "bg-[var(--color-primary)]/20 text-[var(--color-primary)]",
      secondary: "bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]",
      accent: "bg-[var(--color-accent)]/20 text-[var(--color-accent)]",
      danger: "bg-red-500/20 text-red-400",
      warning: "bg-yellow-500/20 text-yellow-400",
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
          ${variants[variant]}
          ${pulse ? "pulse-badge" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps };