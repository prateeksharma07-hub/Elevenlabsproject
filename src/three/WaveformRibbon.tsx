import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

const SEGMENTS = 64;

export const WaveformRibbon: React.FC = () => {
  const { getFrequencyData, isPlaying, scrollProgress } = useStudio();
  const ribbonMesh = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  // Scene 03 focal visibility
  // Appears around scrollProgress 0.45 to 0.75
  const isScene3Active = scrollProgress >= 0.40 && scrollProgress <= 0.80;

  useFrame((state) => {
    if (!geomRef.current || !ribbonMesh.current) return;

    // Fade ribbon opacity based on scroll distance into Scene 03
    const mat = ribbonMesh.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      let targetOpacity = 0;
      if (scrollProgress >= 0.42 && scrollProgress <= 0.74) {
        targetOpacity = 0.85;
      } else if (scrollProgress > 0.35 && scrollProgress < 0.42) {
        targetOpacity = (scrollProgress - 0.35) / 0.07;
      } else if (scrollProgress > 0.74 && scrollProgress < 0.82) {
        targetOpacity = 1 - (scrollProgress - 0.74) / 0.08;
      }
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
      ribbonMesh.current.visible = mat.opacity > 0.01;
    }

    if (!isScene3Active && !isPlaying) return;

    const freq = getFrequencyData();
    const pos = geomRef.current.attributes.position;
    const time = state.clock.elapsedTime;

    // Deform vertices along the ribbon length based on real FFT frequencies
    for (let i = 0; i <= SEGMENTS; i++) {
      const freqIndex = Math.min(127, Math.floor((i / SEGMENTS) * 64));
      const freqVal = isPlaying ? (freq.raw[freqIndex] || 0) / 255 : 0;

      // Idle ambient sinusoidal wave
      const idleWave = Math.sin(time * 2 + i * 0.15) * 0.08;
      const displacement = (freqVal * 0.8) + idleWave;

      // Top and bottom vertices of the plane segment
      pos.setZ(i * 2, displacement);
      pos.setZ(i * 2 + 1, displacement);
    }

    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();

    // Gentle floating rotation
    ribbonMesh.current.rotation.y = time * 0.1;
  });

  return (
    <group position={[0, -0.4, 0]}>
      <mesh ref={ribbonMesh} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry ref={geomRef} args={[6.5, 0.5, SEGMENTS, 1]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          transparent={true}
          opacity={0.0}
          side={THREE.DoubleSide}
          wireframe={true}
        />
      </mesh>
    </group>
  );
};
