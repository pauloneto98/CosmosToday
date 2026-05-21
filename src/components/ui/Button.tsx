"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  shimmer?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", shimmer = true, children, disabled, type = "button", onClick }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 overflow-hidden";
    
    const variants = {
      primary: "bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]/90",
      secondary: "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90",
      ghost: "bg-transparent text-[var(--color-text)] border border-white/10 hover:bg-white/5",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} shimmer-btn ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };