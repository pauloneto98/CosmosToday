"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Html, useTexture } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[1.5, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color="#1a4d7c"
        roughness={0.8}
        metalness={0.1}
      />
    </Sphere>
  );
}

function Atmosphere() {
  return (
    <Sphere args={[1.58, 32, 32]}>
      <meshStandardMaterial
        color="#00D4FF"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.01;
    }
  });

  const positions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 5 + Math.random() * 2;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return (
    <points ref={starsRef} geometry={geometry}>
      <pointsMaterial size={0.05} color="#ffffff" sizeAttenuation />
    </points>
  );
}

function Glow() {
  return (
    <Sphere args={[1.6, 32, 32]}>
      <meshBasicMaterial
        color="#00D4FF"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

interface EarthGlobeProps {
  className?: string;
}

export function EarthGlobe({ className = "" }: EarthGlobeProps) {
  return (
    <div className={`w-full h-full min-h-[400px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D4FF" />
        
        <Stars />
        <Earth />
        <Atmosphere />
        <Glow />
        
        <Html
          position={[2, 1, 0]}
          distanceFactor={10}
          style={{ opacity: 0.8 }}
        >
          <div className="text-[var(--color-primary)] text-xs font-mono">
            🌍 NASA Blue Marble
          </div>
        </Html>
      </Canvas>
    </div>
  );
}