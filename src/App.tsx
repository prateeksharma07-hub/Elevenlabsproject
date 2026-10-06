import React from 'react';
import { StudioProvider } from './state/studioState';
import { AppContent } from './AppContent';

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <AppContent />
    </StudioProvider>
  );
};

export default App;
