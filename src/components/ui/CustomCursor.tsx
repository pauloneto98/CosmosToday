"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

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
    
    // Add hover listeners initially and on mutation
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
    };
  }, [cursorX, cursorY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] border transition-all duration-200 ${
          hovered
            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] scale-150 shadow-[0_0_15px_var(--color-primary)]"
            : "border-white/30 scale-100"
        }`}
      />
      {/* Inner Dot */}
      <motion.div
        style={{
          x: useSpring(useMotionValue(0), springConfig),
          y: useSpring(useMotionValue(0), springConfig),
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        className="fixed pointer-events-none z-[10000] w-2 h-2 bg-white rounded-full translate-x-[12px] translate-y-[12px]"
        animate={{
          scale: hovered ? 1.5 : 1,
          backgroundColor: hovered ? "var(--color-primary)" : "#ffffff",
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
