import { useState, useEffect } from 'react';

export function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if preloader was already seen in this session
    if (sessionStorage.getItem('fire_preloader_seen')) {
      setDismissed(true);
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDismissed(true);
            sessionStorage.setItem('fire_preloader_seen', 'true');
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return next;
      });
    }, 45);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('fire_preloader_seen', 'true');
    if (onComplete) onComplete();
  };

  if (dismissed) return null;

  const totalCircumference = 276.46;
  const strokeOffset = totalCircumference - (totalCircumference * progress) / 100;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-surface-container-lowest flex flex-col items-center justify-between p-space-xl md:p-space-3xl transition-opacity duration-700 ease-out ${
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      id="preloader-overlay"
    >
      <div className="w-full flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-ember-glow animate-ping" />
          <span className="font-label-technical text-label-technical tracking-widest text-primary uppercase">
            WOOD-FIRED PIZZA · EST. 2026
          </span>
        </div>
        <button
          className="px-space-md py-space-2xs bg-surface-container hover:bg-surface-container-high rounded-full font-label-technical text-label-technical text-crust-cream transition-colors cursor-pointer"
          onClick={dismiss}
        >
          SKIP INTRO [ESC]
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-2xl px-space-md my-auto">
        <div className="relative w-28 h-28 mb-space-lg flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-surface-container-high"
              cx="50"
              cy="50"
              fill="none"
              r="44"
              stroke="currentColor"
              strokeWidth="3"
            />
            <circle
              className="text-ember-glow transition-all duration-150"
              cx="50"
              cy="50"
              fill="none"
              id="preloader-circle"
              r="44"
              stroke="currentColor"
              strokeDasharray={totalCircumference}
              strokeDashoffset={strokeOffset}
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-ember-glow animate-pulse">
              local_fire_department
            </span>
            <span className="font-label-technical text-label-technical text-crust-cream font-bold mt-1">
              {progress}%
            </span>
          </div>
        </div>
        <span className="font-label-technical text-label-technical uppercase text-ash-muted tracking-[0.2em] mb-space-xs">
          Baking Protocol Initialized
        </span>
        <h2 className="font-headline-lg text-headline-lg text-crust-cream tracking-tight mb-space-sm">
          Preparing the oven... 450°C
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          San Marzano tomatoes macerated. 72-hour biga naturally leavened. Hearth stoked with seasoned oak logs.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-space-xs text-center">
        <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container via-ember-glow to-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center font-label-technical text-label-sm text-ash-muted">
          <span>KILN #01 T-STAMP</span>
          <span className="text-ember-glow">STABLE @ 450.4°C</span>
        </div>
      </div>
    </div>
  );
}
