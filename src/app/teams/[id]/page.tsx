import { TeamDetail } from '@/components/teams/TeamDetail';
import { BackButton } from '@/components/BackButton';
import { fetchTeamById } from '@/lib/services/teams';
import { fetchGameYearRange } from '@/lib/services/games';

export default async function TeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const teamId = Number(id);

    const [data, yearRange] = await Promise.all([
        fetchTeamById(teamId),
        fetchGameYearRange(),
    ]);

    console.log(yearRange);

    if (!data) {
        return null;
    }

    return (
        <>
            <BackButton />
            <TeamDetail
                data={data}
                minYear={yearRange.minYear}
                maxYear={yearRange.maxYear}
            />
        </>
    );
}
