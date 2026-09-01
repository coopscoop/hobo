import { GameDetail } from '@/components/games/GameDetail';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { fetchGameById } from '@/lib/services/games';

export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let data;
    try {
        data = await fetchGameById(id);
    } catch {
        return notFound();
    }

    if ('error' in data) return notFound();

    return (
        <>
            <BackButton />
            <GameDetail data={data} />
        </>
    );
}
