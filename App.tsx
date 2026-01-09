import React, { useEffect, useState } from 'react';
import GameCanvas from './components/GameCanvas';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get('userId')?.trim();
    const queryName = params.get('name')?.trim();

    if (queryUserId) setUserId(queryUserId);
    if (queryName) setUserName(queryName);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      <GameCanvas userId={userId} userName={userName} />
    </div>
  );
}

export default App;
