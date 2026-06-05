import { PlayerDetail } from '@/components/players/PlayerDetail';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // const currentYear = String(new Date().getFullYear());
    const currentYear = '2025'; // TODO: REMOVE THIS TO GET CURRENT YEAR - JUST PLACEHOLDER FOR NOW

    const [data, gameLog] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/${id}`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/${id}?year=${currentYear}`).then((r) => r.json()),
    ]);

    if (!data) notFound();

    return (
        <>
            <BackButton />
            <PlayerDetail data={data} gameLog={gameLog} currentYearString={currentYear} />
        </>
    );
}
