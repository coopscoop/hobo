'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import {
    Button,
    Typography,
    Box,
    Drawer,
    IconButton,
    useMediaQuery,
    useTheme,
    AppBar,
    Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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

const DRAWER_WIDTH = 240;
const BREAKPOINT = 1000;

export default function Sidebar() {
    const { leagueId, setLeagueId } = useLeague();
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(BREAKPOINT));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        getCurrentAdmin()
            .then(setAdmin)
            .finally(() => setCheckedAuth(true));
    }, [pathname]);

    async function handleLogout() {
        await logout();
        setAdmin(null);
        router.push('/');
        setMobileOpen(false);
    }

    const visibleGroups = admin
        ? NAV_GROUPS
        : NAV_GROUPS.filter((g) => g.label !== 'Admin');

    const handleNavigation = () => {
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    // Sidebar content component
    const sidebarContent = (
        <>
            <div className={styles.logo}>
                <span className={styles.wordmark}>
                    HO<span className={styles.wordmarkAccent}>BO</span>
                </span>
            </div>

            <Box sx={{ px: 0.75, py: 0.5 }}>
                {checkedAuth && (
                    admin ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ wordBreak: 'break-all', opacity: 0.7, color: '#1c1e21' }}>
                                {admin.email}
                            </Typography>
                            <Button size="small" onClick={handleLogout} sx={{ alignSelf: 'flex-start', color: '#c8102e' }}>
                                Log Out
                            </Button>
                        </Box>
                    ) : (
                        <Button 
                            size="small" 
                            component={Link} 
                            href="/login" 
                            onClick={handleNavigation}
                            sx={{ color: '#c8102e' }}
                        >
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
                                            onClick={handleNavigation}
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
        </>
    );

    return (
        <>
            {/* Mobile AppBar */}
            {isMobile && (
                <AppBar position="fixed" className={styles.mobileAppBar}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            onClick={() => setMobileOpen(true)}
                            className={styles.mobileAppBarIcon}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap className={styles.mobileAppBarTitle}>
                            <span className={styles.wordmark}>
                                HO<span className={styles.wordmarkAccent}>BO</span>
                            </span>
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Mobile Drawer - only shown on mobile */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            backgroundColor: '#ffffff',
                            padding: '1.5rem 1.25rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.75rem',
                        },
                    }}
                >
                    {sidebarContent}
                    {/* Mobile close button */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton 
                            onClick={() => setMobileOpen(false)} 
                            className={styles.mobileCloseButton}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Drawer>
            )}

            {/* Desktop Permanent Drawer - only shown on desktop */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #e2e4e8',
                            padding: '1.5rem 1.25rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.75rem',
                            position: 'sticky',
                            top: 0,
                            height: '100vh',
                        },
                    }}
                    open
                >
                    {sidebarContent}
                </Drawer>
            )}
        </>
    );
}
