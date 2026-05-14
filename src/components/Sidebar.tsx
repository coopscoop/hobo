'use client';

import Link from 'next/link';
import styles from './Sidebar.module.css';
import { Typography, Select, MenuItem, FormControl } from '@mui/material';
import { useLeague } from '@/context/LeagueContext';

export default function Sidebar() {
  const { leagueId, setLeagueId } = useLeague();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Typography variant="h4">HOBO</Typography>
        <FormControl size="small" fullWidth sx={{ mt: 1, maxWidth: 160 }}>
          <Select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
          >
            <MenuItem value="all">All Leagues</MenuItem>
            <MenuItem value="2">33+</MenuItem>
            <MenuItem value="1">55+</MenuItem>
          </Select>
        </FormControl>
      </div>
      <nav className={styles.centerVertically}>
        <ul className={styles.navList}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/announcements">Announcements</Link></li>
          <li><Link href="/games">Games & Results</Link></li>
          <li><Link href="/players">Players</Link></li>
          <li><Link href="/executives">Executives</Link></li>
          <li><Link href="/teams">Teams</Link></li>
          <li><Link href="/">Rules</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
