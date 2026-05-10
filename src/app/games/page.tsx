import { getGames } from '@/db/queries/games';
import { GamesTable } from '@/components/games/GamesTable';
import styles from './games.module.css';

export default async function GamesPage() {
  const games = await getGames();
  return (
    <main className={styles.container}>
      <h1>Games</h1>
      <GamesTable games={games} />
    </main>
  );
}
