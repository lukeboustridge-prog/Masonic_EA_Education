import React from 'react';
import GameCanvas from './components/GameCanvas';

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      <GameCanvas />
    </div>
  );
}

export default App;