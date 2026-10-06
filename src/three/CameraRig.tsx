import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudio } from '../state/studioState';

export const CameraRig: React.FC = () => {
  const { scrollProgress, pointer } = useStudio();
  const { camera } = useThree();

  // 3D Cinematic Spline Curve across the 5 Scenes
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 7.5),        // 0.00: Scene 01 (Arrival)
      new THREE.Vector3(0, 0.35, 4.2),     // 0.35: Scene 02 (Studio Console)
      new THREE.Vector3(1.8, 1.1, 5.0),    // 0.58: Scene 03 (Audio World)
      new THREE.Vector3(-1.5, 0.4, 4.6),   // 0.78: Scene 04 (Language Portal)
      new THREE.Vector3(0, 0, 11.2),       // 1.00: Scene 05 (Finale Wide Pullback)
    ]);
  }, []);

  const targetLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const currentPos = useRef(new THREE.Vector3(0, 0, 7.5));

  useFrame(() => {
    // Clamp progress between 0 and 1
    const p = Math.max(0, Math.min(1, scrollProgress));

    // Sample continuous spline position along path
    const splinePos = cameraPath.getPointAt(p);

    // Subtle, organic mouse parallax
    const parallaxX = pointer.x * 0.22;
    const parallaxY = -pointer.y * 0.16;

    const targetX = splinePos.x + parallaxX;
    const targetY = splinePos.y + parallaxY;
    const targetZ = splinePos.z;

    // Smooth lerp to eliminate any discrete input notches
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, 0.09);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, 0.09);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetZ, 0.09);

    camera.position.copy(currentPos.current);

    // Dynamic FOV adjustment
    let targetFov = 45;
    if (p < 0.25) {
      targetFov = 45;
    } else if (p < 0.50) {
      targetFov = 42; // Focused on studio console
    } else if (p < 0.72) {
      targetFov = 48; // Expansive audio arena
    } else if (p < 0.88) {
      targetFov = 44; // Language rings
    } else {
      targetFov = 50; // Wide finale reveal
    }

    const persCamera = camera as THREE.PerspectiveCamera;
    if (persCamera.fov) {
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, 0.08);
      persCamera.updateProjectionMatrix();
    }

    camera.lookAt(targetLookAt);
  });

  return null;
};
