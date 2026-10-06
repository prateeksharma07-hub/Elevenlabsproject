import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

export const LanguageRings: React.FC = () => {
  const { scrollProgress } = useStudio();
  const groupRef = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Fade in during Scene 04 (approx 0.65 to 0.88)
    let targetOpacity = 0;
    if (scrollProgress >= 0.68 && scrollProgress <= 0.86) {
      targetOpacity = 0.75;
    } else if (scrollProgress > 0.60 && scrollProgress < 0.68) {
      targetOpacity = (scrollProgress - 0.60) / 0.08;
    } else if (scrollProgress > 0.86 && scrollProgress < 0.94) {
      targetOpacity = 1 - (scrollProgress - 0.86) / 0.08;
    }

    [ring1, ring2, ring3].forEach((r) => {
      if (r.current) {
        const mat = r.current.material as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
      }
    });

    groupRef.current.visible = targetOpacity > 0.01;

    // Multi-axis orbital rotation
    if (ring1.current) ring1.current.rotation.z += delta * 0.2;
    if (ring2.current) ring2.current.rotation.x += delta * 0.15;
    if (ring3.current) ring3.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer Polyglot Ring 1 */}
      <mesh ref={ring1} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[2.6, 0.01, 16, 72]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.6}
          transparent={true}
          opacity={0}
        />
      </mesh>

      {/* Outer Polyglot Ring 2 */}
      <mesh ref={ring2} rotation={[0, 0.8, 0]}>
        <torusGeometry args={[3.1, 0.01, 16, 72]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          transparent={true}
          opacity={0}
        />
      </mesh>

      {/* Outer Polyglot Ring 3 */}
      <mesh ref={ring3} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[3.6, 0.008, 16, 72]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0}
        />
      </mesh>
    </group>
  );
};
