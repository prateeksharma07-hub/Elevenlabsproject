import React, { useState } from 'react';
import { CinematicLoader } from '../three/CinematicLoader';

export const Preloader: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  return (
    <CinematicLoader
      onComplete={() => {
        setIsDismissed(true);
      }}
    />
  );
};
