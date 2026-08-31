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
          {/* Home */}
          <li><h3 style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '0px', marginBottom: '10px', display: 'block' }} className={styles.categoryTitle}>Home</h3></li>
          <li><Link href="/">Home Page</Link></li>
          <li><Link href="/announcements">Announcements</Link></li>

          {/* Stats */}
          <li><h3 style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '10px', marginBottom: '10px', display: 'block' }} className={styles.categoryTitle}>Stats</h3></li>
          <li><Link href="/games">Games & Results</Link></li>
          <li><Link href="/players">Players</Link></li>
          <li><Link href="/teams">Teams</Link></li>
          <li><Link href="/leagueChampions">League Champs</Link></li>

          {/* Rules */}
          <li><h3 style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '10px', marginBottom: '10px', display: 'block' }} className={styles.categoryTitle}>Rules</h3></li>
          <li><Link href="/rules">Rules</Link></li>
          <li><Link href="/howToScore">How to Score</Link></li>
          <li><Link href="/101">101: For new players</Link></li>
          <li><Link href="/201">201: For returning players</Link></li>

          {/* People */}
          <li><h3 style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '10px', marginBottom: '10px', display: 'block' }} className={styles.categoryTitle}>Awards</h3></li>
          <li><Link href="/hallOfFame">Hall of Fame</Link></li>
          <li><Link href="/edBrilAward">Ed Bril Award</Link></li>
          <li><Link href="/executives">Executives</Link></li>

          {/* Contact us */}
          <li><h3 style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '10px', marginBottom: '10px', display: 'block' }} className={styles.categoryTitle}>Contact Us</h3></li>
          <li><Link href="/contact">Contact Us</Link></li>
        </ul
        ></nav>
    </aside>
  );
}
