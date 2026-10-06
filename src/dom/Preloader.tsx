import React, { useState, useEffect } from 'react';

export const Preloader: React.FC = () => {
  const [percent, setPercent] = useState<number>(0);
  const [status, setStatus] = useState<string>('INITIALIZING VOICE ENGINE');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const sequence = [
      { p: 25, label: 'CALIBRATING QUANTUM CORE' },
      { p: 60, label: 'SYNCHRONIZING NEURAL PIPELINE' },
      { p: 85, label: 'ESTABLISHING 3D ACOUSTIC SPACE' },
      { p: 100, label: 'ENTERING AURA' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        setStatus('ENTERING AURA');
        clearInterval(interval);
        setTimeout(() => {
          setIsDismissed(true);
        }, 200);
      } else {
        setPercent(current);
        const step = sequence.find((s) => current >= s.p && current < s.p + 25);
        if (step) setStatus(step.label);
      }
    }, 28);

    // Guaranteed watchdog timeout: dismisses under any circumstance within 1.6s
    const watchdog = setTimeout(() => {
      setIsDismissed(true);
    }, 1600);

    return () => {
      clearInterval(interval);
      clearTimeout(watchdog);
    };
  }, []);

  return (
    <div className={`preloader-overlay ${isDismissed ? 'hidden' : ''}`}>
      <div className="preloader-logo">AURA</div>
      <div className="preloader-bar-wrap">
        <div className="preloader-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="preloader-status">{status}</div>
    </div>
  );
};
