"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && dotRef.current) {
        // Hardware accelerated positioning with ZERO lag
        cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      }
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.opacity = "0";
        dotRef.current.style.opacity = "0";
      }
      setVisible(false);
    };

    const handleMouseEnter = () => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.opacity = "1";
        dotRef.current.style.opacity = "1";
      }
      setVisible(true);
    };

    const addHoverListeners = () => {
      const clickables = document.querySelectorAll(
        "button, a, input[type='button'], input[type='submit'], [role='button'], .cursor-pointer"
      );
      clickables.forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Initial check
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
    };
  }, [visible]);

  return (
    <>
      {/* Outer Glow Ring (Zero Lag, Hardware-Accelerated) */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] border transition-all duration-150 ease-out ${
          hovered
            ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] scale-125 shadow-[0_0_12px_var(--color-primary)]"
            : "border-cyan-400/40 scale-100 shadow-[0_0_4px_rgba(0,212,255,0.1)]"
        }`}
        style={{
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      />
      {/* Inner Dot (Zero Lag, Hardware-Accelerated) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[10000] transition-all duration-150 ease-out ${
          hovered ? "bg-[var(--color-accent)] scale-150" : "bg-white scale-100"
        }`}
        style={{
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      />
    </>
  );
}
