"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentRingX = 0;
    let currentRingY = 0;
    let currentDotX = 0;
    let currentDotY = 0;

    const moveCursor = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);
    };

    // Smooth Lerp loop for the perfect lag-free, premium inertia effect
    const updatePosition = () => {
      // Ring follows mouse with smooth lerp (0.15 velocity)
      currentRingX += (targetX - currentRingX) * 0.15;
      currentRingY += (targetY - currentRingY) * 0.15;

      // Dot follows mouse instantly for ultra-responsive feel
      currentDotX += (targetX - currentDotX) * 0.85;
      currentDotY += (targetY - currentDotY) * 0.85;

      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentRingX}px, ${currentRingY}px, 0)`;
        dotRef.current.style.transform = `translate3d(${currentDotX}px, ${currentDotY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const addHoverListeners = () => {
      const clickables = document.querySelectorAll(
        "button, a, input[type='button'], input[type='submit'], [role='button'], .cursor-pointer, [onclick]"
      );
      clickables.forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible]);

  return (
    <>
      {/* Outer Glow Nebula Orbit Ring (Hardware-Accelerated Positioning, centered) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed transition-all duration-300 ease-out ${
            hovered
              ? "w-14 h-14 border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-110 rotate-45 shadow-[0_0_20px_rgba(0,212,255,0.4)]"
              : "w-10 h-10 border-cyan-400/30 scale-100 rotate-0 animate-[spin_20s_linear_infinite]"
          }`}
        />
      </div>
      
      {/* Inner Stardust Glowing Dot (Hardware-Accelerated Positioning, centered) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] transition-opacity duration-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-out ${
            hovered 
              ? "w-3 h-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 shadow-[0_0_12px_#7B61FF]" 
              : "w-1.5 h-1.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          }`}
        />
      </div>
    </>
  );
}

