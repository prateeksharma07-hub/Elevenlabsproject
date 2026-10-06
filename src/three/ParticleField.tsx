import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

const PARTICLE_COUNT = 1800;

export const ParticleField: React.FC = () => {
  const { getFrequencyData, isPlaying } = useStudio();
  const pointsRef = useRef<THREE.Points>(null);

  // Precompute cylindrical / orbital coordinates for atmospheric stardust
  const [positions, initialPositions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const initialPos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT);
    const cols = new Float32Array(PARTICLE_COUNT * 3);

    const primaryColor = new THREE.Color('#38bdf8'); // Subtle cyan
    const neutralColor = new THREE.Color('#94a3b8'); // Soft starlight gray
    const secondaryColor = new THREE.Color('#818cf8'); // Delicate iris

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2.5 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 8.0;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initialPos[i * 3] = x;
      initialPos[i * 3 + 1] = y;
      initialPos[i * 3 + 2] = z;

      vel[i] = 0.05 + Math.random() * 0.12;

      // Color palette: restrained whites and delicate cyan/iris
      const t = Math.random();
      let chosenColor: THREE.Color;
      if (t < 0.55) {
        chosenColor = neutralColor;
      } else if (t < 0.85) {
        chosenColor = primaryColor;
      } else {
        chosenColor = secondaryColor;
      }

      cols[i * 3] = chosenColor.r;
      cols[i * 3 + 1] = chosenColor.g;
      cols[i * 3 + 2] = chosenColor.b;
    }

    return [pos, initialPos, vel, cols];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const currentPositions = posAttr.array as Float32Array;

    const freq = getFrequencyData();
    const energy = isPlaying ? freq.energy : 0;
    const bass = isPlaying ? freq.bass : 0;

    const rotSpeed = 0.04 + energy * 0.08;
    pointsRef.current.rotation.y += delta * rotSpeed;

    // Subtle gentle audio responsiveness: particles breathe slightly with music
    if (isPlaying) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const initialX = initialPositions[idx];
        const initialZ = initialPositions[idx + 2];
        const scale = 1 + bass * 0.12;
        currentPositions[idx] = initialX * scale;
        currentPositions[idx + 2] = initialZ * scale;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        vertexColors={true}
        transparent={true}
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};
