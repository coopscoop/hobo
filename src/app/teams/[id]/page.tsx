import { TeamDetail } from '@/components/teams/TeamDetail';
import { BackButton } from '@/components/BackButton';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [data, yearRange] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${id}`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/yearrange`).then((r) => r.json()),
    ]);

    return (
        <>
            <BackButton />
            <TeamDetail data={data} minYear={yearRange.minYear} maxYear={yearRange.maxYear} />
        </>
    );
}
