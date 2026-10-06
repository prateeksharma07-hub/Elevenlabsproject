import React from 'react';
import { AuraCore } from './AuraCore';
import { ParticleField } from './ParticleField';
import { WaveformRibbon } from './WaveformRibbon';
import { LanguageRings } from './LanguageRings';

export const SceneWorld: React.FC = () => {
  return (
    <>
      {/* Void Cosmic Atmospheric Fog */}
      <fogExp2 attach="fog" args={['#030509', 0.038]} />

      {/* Ambient Lighting Architecture */}
      <ambientLight color="#070c18" intensity={0.65} />

      {/* Main Directional Specular Key */}
      <directionalLight
        color="#ffffff"
        intensity={1.6}
        position={[4, 6, 6]}
      />

      {/* Subtle Precision Rim Backlight */}
      <directionalLight
        color="#38bdf8"
        intensity={1.8}
        position={[-6, 3, -5]}
      />

      {/* Soft Supporting Iris Fill */}
      <directionalLight
        color="#818cf8"
        intensity={0.9}
        position={[0, -4, 4]}
      />

      {/* Core 3D Objects */}
      <AuraCore />
      <ParticleField />
      <WaveformRibbon />
      <LanguageRings />
    </>
  );
};
