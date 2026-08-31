import { HomePageClient } from '@/components/home/HomePageClient';
import { fetchUpcomingGames, fetchRecentGames } from '@/lib/services/games';
import { fetchTeams } from '@/lib/services/teams';
import { fetchAnnouncements } from '@/lib/services/announcements';

export default async function HomePage() {
    const [upcomingGames, recentGames, standings, pinnedNews, seasonNews] = await Promise.all([
        fetchUpcomingGames(),
        fetchRecentGames(),
        fetchTeams(),
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
