import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

export const AuraCore: React.FC = () => {
  const { getFrequencyData, isPlaying, isGenerating } = useStudio();
  const coreGroup = useRef<THREE.Group>(null);
  const outerGlassRef = useRef<THREE.Mesh>(null);
  const innerPlasmaRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  // Smooth lerped frequency values
  const smoothAudio = useRef({ bass: 0, mid: 0, energy: 0 });

  useFrame((state, delta) => {
    const freq = getFrequencyData();

    // Lerp audio energy for silky continuity
    smoothAudio.current.bass = THREE.MathUtils.lerp(smoothAudio.current.bass, freq.bass, 0.15);
    smoothAudio.current.mid = THREE.MathUtils.lerp(smoothAudio.current.mid, freq.mid, 0.15);
    smoothAudio.current.energy = THREE.MathUtils.lerp(smoothAudio.current.energy, freq.energy, 0.15);

    const bass = smoothAudio.current.bass;
    const mid = smoothAudio.current.mid;
    const energy = smoothAudio.current.energy;

    // Base rotation
    const rotSpeed = isGenerating ? 1.8 : isPlaying ? 0.6 + energy * 0.8 : 0.25;

    if (coreGroup.current) {
      coreGroup.current.rotation.y += delta * rotSpeed * 0.5;
      coreGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }

    // Outer Glass Shell pulse
    if (outerGlassRef.current) {
      const targetScale = 1.0 + (isPlaying ? bass * 0.14 : isGenerating ? 0.08 * Math.sin(state.clock.elapsedTime * 8) : 0);
      outerGlassRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // Inner Plasma deformation & color shift
    if (innerPlasmaRef.current) {
      innerPlasmaRef.current.rotation.y -= delta * rotSpeed * 0.9;
      innerPlasmaRef.current.rotation.z += delta * rotSpeed * 0.4;
      const plasmaScale = 0.85 + (isPlaying ? energy * 0.25 : isGenerating ? 0.15 * Math.sin(state.clock.elapsedTime * 6) : 0);
      innerPlasmaRef.current.scale.set(plasmaScale, plasmaScale, plasmaScale);

      const mat = innerPlasmaRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isGenerating) {
          mat.emissive.setRGB(0.13, 0.82, 0.93); // Cyan pulse
          mat.emissiveIntensity = 2.0 + Math.sin(state.clock.elapsedTime * 10) * 0.8;
        } else if (isPlaying) {
          mat.emissive.setRGB(0.13 + bass * 0.3, 0.82 - bass * 0.2, 0.93);
          mat.emissiveIntensity = 1.2 + energy * 2.2;
        } else {
          mat.emissive.setRGB(0.13, 0.82, 0.93);
          mat.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
        }
      }
    }

    // Orbital Rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * (0.3 + energy * 0.4);
      ring1Ref.current.rotation.x = 0.4 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
      const ringScale = 1.0 + (isPlaying ? mid * 0.15 : 0);
      ring1Ref.current.scale.set(ringScale, ringScale, ringScale);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * (0.25 + energy * 0.3);
      ring2Ref.current.rotation.x = -0.3 + Math.cos(state.clock.elapsedTime * 0.35) * 0.1;
      const ringScale = 1.0 + (isPlaying ? bass * 0.18 : 0);
      ring2Ref.current.scale.set(ringScale, ringScale, ringScale);
    }

    // Dynamic Point Light
    if (coreLightRef.current) {
      coreLightRef.current.intensity = isGenerating ? 3.5 : isPlaying ? 2.0 + energy * 3.0 : 1.4;
    }
  });

  return (
    <group ref={coreGroup} position={[0, 0, 0]}>
      {/* Central Core Light */}
      <pointLight
        ref={coreLightRef}
        color="#22d3ee"
        intensity={1.8}
        distance={12}
        decay={2}
      />

      {/* Secondary Rim Fill Light */}
      <pointLight
        color="#6366f1"
        intensity={1.2}
        position={[0, -0.5, 0]}
        distance={8}
      />

      {/* 1. Outer Dielectric Glass Shell */}
      <mesh ref={outerGlassRef}>
        <sphereGeometry args={[1.35, 48, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          roughness={0.12}
          ior={1.52}
          thickness={1.6}
          transparent={true}
          opacity={1.0}
          reflectivity={0.7}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 2. Inner Neural Plasma Core */}
      <mesh ref={innerPlasmaRef}>
        <icosahedronGeometry args={[0.82, 3]} />
        <meshStandardMaterial
          color="#080e1a"
          emissive="#22d3ee"
          emissiveIntensity={1.0}
          roughness={0.3}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* 3. Core Wireframe Resonator */}
      <mesh>
        <icosahedronGeometry args={[0.95, 2]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* 4. Orbital Frequency Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.75, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.65}
        />
      </mesh>

      {/* 5. Orbital Frequency Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.05, 0.012, 16, 64]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};
