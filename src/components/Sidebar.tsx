import Link from 'next/link';
import styles from './Sidebar.module.css';
import { Typography } from '@mui/material';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Typography variant="h4">HOBO</Typography>
        <Typography>some league change here</Typography>
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
