"use client";

import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  ...props
}: SkeletonProps) {
  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`
        animate-pulse bg-white/5
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-6 space-y-4">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <Skeleton variant="text" height={24} className="w-3/4" />
      <Skeleton variant="text" height={16} className="w-full" />
      <Skeleton variant="text" height={16} className="w-2/3" />
    </div>
  );
}

export function APODSkeleton() {
  return (
    <div className="glass p-6 space-y-4 col-span-2">
      <Skeleton variant="rectangular" height={300} className="w-full" />
      <Skeleton variant="text" height={32} className="w-full" />
      <Skeleton variant="text" height={20} className="w-4/5" />
      <Skeleton variant="text" height={16} className="w-full" />
    </div>
  );
}