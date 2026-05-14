'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type LeagueContextType = {
  leagueId: string;
  setLeagueId: (id: string) => void;
};

const LeagueContext = createContext<LeagueContextType>({
  leagueId: 'all',
  setLeagueId: () => { },
});

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [leagueId, setLeagueIdState] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('leagueId');
    if (stored) setLeagueIdState(stored);
  }, []);

  function setLeagueId(id: string) {
    setLeagueIdState(id);
    localStorage.setItem('leagueId', id);
  }

  return (
    <LeagueContext.Provider value={{ leagueId, setLeagueId }}>
      {children}
    </LeagueContext.Provider>
  );
}

export const useLeague = () => useContext(LeagueContext);
