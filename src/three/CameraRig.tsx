import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

export const CameraRig: React.FC = () => {
  const { scrollProgress, pointer, isPlaying } = useStudio();
  const { camera } = useThree();

  // 3D Cinematic Spline Curve across the 5 Sections:
  // 0.00: Intro (Arrival) - camera elevated slightly, core floats gracefully above nodes
  // 0.25: Studio - camera pulls back to z = 10.2, core becomes a subtle ambient background
  // 0.50: Audio Arena - close-up view of the 3D reactive waveform ribbon
  // 0.75: Translation - balanced soft angle
  // 1.00: Finale - expansive pullback into the cosmic void
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, 7.2),     // 0.00: Intro
      new THREE.Vector3(0, -0.6, 10.2),    // 0.25: Studio
      new THREE.Vector3(0, 0.2, 5.4),      // 0.50: Audio Arena
      new THREE.Vector3(-0.9, 0.2, 7.8),   // 0.75: Translation
      new THREE.Vector3(0, 0.5, 12.0),     // 1.00: Finale
    ]);
  }, []);

  const targetLookAt = useMemo(() => new THREE.Vector3(0, 0.2, 0), []);
  const currentPos = useRef(new THREE.Vector3(0, 0.35, 7.2));

  useFrame(() => {
    const p = Math.max(0, Math.min(1, scrollProgress));

    // Sample continuous spline position along path
    const splinePos = cameraPath.getPointAt(p);

    // Subtle, organic mouse parallax
    const parallaxX = pointer.x * 0.15;
    const parallaxY = -pointer.y * 0.10;

    const targetX = splinePos.x + parallaxX;
    const targetY = splinePos.y + parallaxY;
    const targetZ = splinePos.z;

    // Smooth lerp for silky inertia
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, 0.08);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, 0.08);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetZ, 0.08);

    camera.position.copy(currentPos.current);

    // Dynamic FOV adjustment
    let targetFov = 45;
    if (p < 0.20) {
      targetFov = 44;
    } else if (p < 0.45) {
      targetFov = 38; // Focused studio view
    } else if (p < 0.68) {
      targetFov = isPlaying ? 52 : 46;
    } else if (p < 0.88) {
      targetFov = 42;
    } else {
      targetFov = 50;
    }

    const persCamera = camera as THREE.PerspectiveCamera;
    if (persCamera.fov) {
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, 0.06);
      persCamera.updateProjectionMatrix();
    }

    camera.lookAt(targetLookAt);
  });

  return null;
};
