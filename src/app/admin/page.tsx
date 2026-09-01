import AdminPageClient from "@/components/admin/AdminPageClient";
import { fetchAnnouncements } from "@/lib/services/announcements";
import { fetchGamesList, fetchGameYearRange } from "@/lib/services/games";
import { fetchPlayers } from "@/lib/services/players";
import { fetchTeams } from "@/lib/services/teams";
import { fetchFields } from "@/lib/services/fields";
import { fetchPages } from "@/lib/services/pages";

export default async function AdminPage() {
    // const session = await auth();
    // if (!session) redirect("/login");

    const [announcements, games, players, teams, fields, pages] = await Promise.all([
        fetchAnnouncements(),
        fetchGamesList(),
        fetchPlayers(),
        fetchTeams(),
        fetchFields(),
        fetchPages(),
    ]);

    return (
        <AdminPageClient
            initialAnnouncements={announcements}
            initialGames={games}
            initialPlayers={players}
            initialTeams={teams}
            initialFields={fields}
            initialPages={pages}
        />
    );
}
