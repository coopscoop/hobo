'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { Select, MenuItem, FormControl } from '@mui/material';
import { useLeague } from '@/context/LeagueContext';

interface NavGroup {
    label: string;
    links: { href: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Home',
        links: [
            { href: '/', label: 'Home Page' },
        ],
    },
    {
        label: 'Stats',
        links: [
            { href: '/games', label: 'Schedule & Results' },
            { href: '/players', label: 'Players' },
            { href: '/teams', label: 'Teams' },
        ],
    },
    {
        label: 'Rules',
        links: [
            { href: '/rules', label: 'Rules' },
            { href: '/howToScore', label: 'How to Score' },
            { href: '/101', label: '101: For New Players' },
            { href: '/201', label: '201: For Returning Players' },
        ],
    },
    {
        label: 'Extras',
        links: [
            { href: '/leagueChampions', label: 'League Champs' },
            { href: '/hallOfFame', label: 'Hall of Fame' },
            { href: '/edBrilAward', label: 'Ed Bril Award' },
            { href: '/executives', label: 'Executives' },
        ],
    },
    {
        label: 'Contact Us',
        links: [{ href: '/contact', label: 'Contact Us' }],
    },
    {
        label: 'Admin',
        links: [{ href: '/admin', label: 'Admin Panel' }],
    },
];

export default function Sidebar() {
    const { leagueId, setLeagueId } = useLeague();
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className={styles.wordmark}>
                    HO<span className={styles.wordmarkAccent}>BO</span>
                </span>
                {/* <FormControl size="small" fullWidth> */}
                {/*   <Select */}
                {/*     value={leagueId} */}
                {/*     onChange={(e) => setLeagueId(e.target.value)} */}
                {/*   > */}
                {/*     <MenuItem value="all">All Leagues</MenuItem> */}
                {/*     <MenuItem value="2">33+</MenuItem> */}
                {/*     <MenuItem value="1">55+</MenuItem> */}
                {/*   </Select> */}
                {/* </FormControl> */}
            </div>
            <nav className={styles.nav}>
                {NAV_GROUPS.map((group) => (
                    <div className={styles.navGroup} key={group.label}>
                        <p className={styles.groupLabel}>{group.label}</p>
                        <ul className={styles.navList}>
                            {group.links.map((link) => {
                                const active = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
