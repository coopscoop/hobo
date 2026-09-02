'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { Select, MenuItem, FormControl, Button, Typography, Box } from '@mui/material';
import { useLeague } from '@/context/LeagueContext';
import { getCurrentAdmin, logout } from '@/lib/services/auth';

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
            // { href: '/executives', label: 'Executives' },
        ],
    },
    {
        label: 'Contact Us',
        links: [{ href: '/contact', label: 'Contact Info' }],
    },
    {
        label: 'Admin',
        links: [{ href: '/admin', label: 'Admin Panel' }],
    },
];

export default function Sidebar() {
    const { leagueId, setLeagueId } = useLeague();
    const pathname = usePathname();
    const router = useRouter();
    const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        getCurrentAdmin()
            .then(setAdmin)
            .finally(() => setCheckedAuth(true));
    }, [pathname]); // re-checks on navigation, which is what picks up a fresh login after the /login page redirects to /admin

    async function handleLogout() {
        await logout();
        setAdmin(null);
        router.push('/');
    }

    const visibleGroups = admin
        ? NAV_GROUPS
        : NAV_GROUPS.filter((g) => g.label !== 'Admin');

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className={styles.wordmark}>
                    HO<span className={styles.wordmarkAccent}>BO</span>
                </span>
            </div>

            <Box sx={{ px: 2, py: 1 }}>
                {checkedAuth && (
                    admin ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ wordBreak: 'break-all', opacity: 0.7 }}>
                                {admin.email}
                            </Typography>
                            <Button size="small" onClick={handleLogout} sx={{ alignSelf: 'flex-start' }}>
                                Log Out
                            </Button>
                        </Box>
                    ) : (
                        <Button size="small" component={Link} href="/login">
                            Sign In
                        </Button>
                    )
                )}
            </Box>

            <nav className={styles.nav}>
                {visibleGroups.map((group) => (
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
