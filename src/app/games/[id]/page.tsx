import { GameDetail } from '@/components/games/GameDetail';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/${id}`).then((r) => r.json());

    if ('error' in data) {
        return notFound();
    }

    return (
        <>
            <BackButton />
            <GameDetail data={data} />
        </>
    );
}
