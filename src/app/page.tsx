import { HomePageClient } from '@/components/home/HomePageClient';

export default async function HomePage() {
  const [upcomingGames, recentGames, pinnedNews, seasonNews] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/upcoming`).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/recent`).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/pinned`).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/general`).then((r) => r.json()),
  ]);

  return (
    <HomePageClient
      initialUpcoming={upcomingGames}
      initialRecent={recentGames}
      initialPinned={pinnedNews}
      initialSeason={seasonNews}
    />
  );
}
