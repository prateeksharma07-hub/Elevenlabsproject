import React, { Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { SceneWorld } from './SceneWorld';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[AURA WebGL] Graphics canvas notice, falling back safely:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const CanvasContainer: React.FC = () => {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

  return (
    <div className="webgl-canvas-container" id="webgl-canvas-container">
      <WebGLErrorBoundary
        fallback={
          <div style={{ position: 'absolute', inset: 0, background: '#030509' }} />
        }
      >
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          dpr={dpr}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <CameraRig />
          <SceneWorld />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
