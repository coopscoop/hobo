import { NuqsAdapter } from 'nuqs/adapters/next/app';
import ThemeRegistry from '@/components/ThemeRegistry';
import { LeagueProvider } from '@/context/LeagueContext';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';
import './globals.css';
import DateLocalizationProvider from '@/components/DateLocalizationProvider';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={styles.body}>
                <LeagueProvider>
                    <DateLocalizationProvider>
                        <ThemeRegistry>
                            <NuqsAdapter>
                                <div className={styles.layout}>
                                    <Sidebar />
                                    <main className={styles.main}>
                                        {children}
                                    </main>
                                </div>
                            </NuqsAdapter>
                        </ThemeRegistry>
                    </DateLocalizationProvider>
                </LeagueProvider>
            </body>
        </html>
    );
}
