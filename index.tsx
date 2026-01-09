import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoreModal from './components/LoreModal';
import { Orb } from './types';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const IntroGate: React.FC = () => {
  const [introStep, setIntroStep] = useState(0);

  const introData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name')?.trim() ?? '';
    const rank = params.get('rank')?.trim() ?? '';
    const initiationDate = params.get('initiationDate')?.trim() ?? '';
    const rawGrandOfficer = params.get('isGrandOfficer')?.trim() ?? '';
    const normalized = rawGrandOfficer.toLowerCase();
    const isGrandOfficer =
      normalized === 'true' || normalized === '1' || normalized === 'yes';

    return {
      name,
      rank,
      initiationDate,
      hasIntro: Boolean(name && rank && initiationDate),
      isGrandOfficer: rawGrandOfficer ? isGrandOfficer : null
    };
  }, []);

  const introSteps = useMemo(() => {
    if (!introData.hasIntro) return [];

    return [
      {
        speaker: 'Inner Guard',
        blurb: 'Whom have you there?',
        spriteKey: 'inner_guard'
      },
      {
        speaker: 'Tyler',
        blurb: `${introData.name}, ${introData.rank}, who was initiated on ${introData.initiationDate}.`,
        spriteKey: 'square_compass'
      }
    ];
  }, [introData]);

  if (introData.hasIntro && introStep < introSteps.length) {
    const step = introSteps[introStep];
    const introOrb: Orb = {
      id: 990 + introStep,
      x: 0,
      y: 0,
      radius: 0,
      active: true,
      name: step.speaker,
      spriteKey: step.spriteKey,
      blurb: step.blurb
    };

    return (
      <LoreModal
        orb={introOrb}
        isIntro
        onNext={() => setIntroStep((current) => current + 1)}
      />
    );
  }

  return <App />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <IntroGate />
  </React.StrictMode>
);
