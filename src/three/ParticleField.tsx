import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

const PARTICLE_COUNT = 1400;

export const ParticleField: React.FC = () => {
  const { getFrequencyData, isPlaying } = useStudio();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Precompute initial positions, velocities, and radii
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Cylindrical/toroidal distribution around core
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 5.5;
      const height = (Math.random() - 0.5) * 4.5;
      const speed = 0.08 + Math.random() * 0.15;
      const size = 0.015 + Math.random() * 0.035;

      data.push({
        baseAngle: angle,
        currentAngle: angle,
        baseRadius: radius,
        currentRadius: radius,
        y: height,
        baseY: height,
        speed,
        size,
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle instances
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];
      dummy.position.set(
        Math.cos(p.baseAngle) * p.baseRadius,
        p.baseY,
        Math.sin(p.baseAngle) * p.baseRadius
      );
      dummy.scale.set(p.size, p.size, p.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color variation between cyan and lavender
      const t = Math.random();
      if (t < 0.6) {
        color.set('#22d3ee'); // Cyan
      } else if (t < 0.85) {
        color.set('#6366f1'); // Indigo
      } else {
        color.set('#ec4899'); // Accent Pink
      }
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particleData, dummy]);

  // Dynamic animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const freq = getFrequencyData();
    const energy = isPlaying ? freq.energy : 0;
    const bass = isPlaying ? freq.bass : 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];

      // Orbit rotation
      p.currentAngle += delta * p.speed * (1 + energy * 1.5);

      // Audio outward expansion
      const targetRadius = p.baseRadius + (isPlaying ? bass * 1.2 : 0);
      p.currentRadius = THREE.MathUtils.lerp(p.currentRadius, targetRadius, 0.1);

      // Subtle vertical wave float
      p.y = p.baseY + Math.sin(state.clock.elapsedTime * 0.8 + p.baseAngle * 2) * 0.18;

      const x = Math.cos(p.currentAngle) * p.currentRadius;
      const z = Math.sin(p.currentAngle) * p.currentRadius;

      dummy.position.set(x, p.y, z);

      const dynamicScale = p.size * (1 + energy * 0.8);
      dummy.scale.set(dynamicScale, dynamicScale, dynamicScale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        transparent={true}
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
