import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

const SEGMENTS = 64;

export const WaveformRibbon: React.FC = () => {
  const { getFrequencyData, isPlaying, scrollProgress } = useStudio();
  const ribbonMesh = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (!geomRef.current || !ribbonMesh.current) return;

    // Visibility is active in the Audio section (around 0.38 - 0.68) OR anytime audio is playing
    const inAudioSection = scrollProgress >= 0.36 && scrollProgress <= 0.68;
    const shouldShow = inAudioSection || isPlaying;

    const mat = ribbonMesh.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      let targetOpacity = 0;
      if (shouldShow) {
        targetOpacity = isPlaying ? 0.95 : 0.45;
      }
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
      ribbonMesh.current.visible = mat.opacity > 0.02;
    }

    if (!shouldShow) return;

    const freq = getFrequencyData();
    const pos = geomRef.current.attributes.position;
    const time = state.clock.elapsedTime;

    // Deform vertices along ribbon based on real FFT frequencies
    for (let i = 0; i <= SEGMENTS; i++) {
      const freqIndex = Math.min(127, Math.floor((i / SEGMENTS) * 64));
      const freqVal = isPlaying ? (freq.raw[freqIndex] || 0) / 255 : 0;

      // Subtle ambient idle sine undulation
      const idleWave = Math.sin(time * 2.5 + i * 0.18) * 0.06;
      const displacement = (freqVal * 0.85) + idleWave;

      pos.setZ(i * 2, displacement);
      pos.setZ(i * 2 + 1, displacement);
    }

    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();

    // Subtle axial rotation
    ribbonMesh.current.rotation.y = time * 0.08;
  });

  return (
    <group position={[0, -0.3, 0]}>
      <mesh ref={ribbonMesh} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry ref={geomRef} args={[6.8, 0.55, SEGMENTS, 1]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.85}
          transparent={true}
          opacity={0.0}
          side={THREE.DoubleSide}
          wireframe={true}
        />
      </mesh>
    </group>
  );
};
