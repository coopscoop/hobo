import { HomePageClient } from '@/components/home/HomePageClient';
import { fetchUpcomingGames, fetchRecentGames } from '@/lib/services/games';
import { fetchAnnouncements } from '@/lib/services/announcements';
import { fetchStandings } from '@/lib/services/standings';

export default async function HomePage() {
    const [upcomingGames, recentGames, standings, pinnedNews, seasonNews] = await Promise.all([
        fetchUpcomingGames(),
        fetchRecentGames(),
        fetchStandings(),
        fetchAnnouncements({ pinned: true }),
        fetchAnnouncements({ pinned: false }),
    ]);

    return (
        <HomePageClient
            initialUpcoming={upcomingGames}
            initialRecent={recentGames}
            initialStandings={standings}
            initialPinned={pinnedNews}
            initialSeason={seasonNews}
        />
    );
}
