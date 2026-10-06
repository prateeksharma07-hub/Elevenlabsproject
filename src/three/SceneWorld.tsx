import React from 'react';
import { AuraCore } from './AuraCore';
import { ParticleField } from './ParticleField';
import { WaveformRibbon } from './WaveformRibbon';
import { LanguageRings } from './LanguageRings';

export const SceneWorld: React.FC = () => {
  return (
    <>
      {/* Void Cosmic Fog */}
      <fogExp2 attach="fog" args={['#030509', 0.032]} />

      {/* Lighting Architecture */}
      <ambientLight color="#080e1a" intensity={0.5} />

      {/* Main Directional Specular Key */}
      <directionalLight
        color="#ffffff"
        intensity={1.8}
        position={[4, 6, 6]}
      />

      {/* Dramatic Cyan Rim Backlight */}
      <directionalLight
        color="#22d3ee"
        intensity={2.2}
        position={[-6, 3, -5]}
      />

      {/* Soft Indigo Fill */}
      <directionalLight
        color="#6366f1"
        intensity={1.0}
        position={[0, -4, 4]}
      />

      {/* Central 3D Visual Objects */}
      <AuraCore />
      <ParticleField />
      <WaveformRibbon />
      <LanguageRings />

      {/* Deep Space Coordinate Plane */}
      <mesh position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40, 32, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe={true}
          transparent={true}
          opacity={0.035}
        />
      </mesh>
    </>
  );
};
