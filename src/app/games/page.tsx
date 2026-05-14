'use client';

import { useEffect, useState } from 'react';
import { useLeague } from '@/context/LeagueContext';
import { GamesTable } from '@/components/games/GamesTable';
import type { GameListItem } from '@/types';

export default function GamesPage() {
  const { leagueId } = useLeague();
  const [games, setGames] = useState<GameListItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (leagueId !== 'all') params.set('leagueId', leagueId);

    Promise.all([
      fetch(`/api/games?${params}`)
        .then((r) => r.json())
        .then(setGames)
    ]);
  }, [leagueId]);

  console.log('games: ', games);

  return <GamesTable games={games} />;
}
