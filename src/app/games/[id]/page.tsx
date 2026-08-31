import { GameDetail } from '@/components/games/GameDetail';
import EditGamePage from '@/components/games/EditGamePage';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { getGameEditData } from '@/lib/db/queries/games';

export default async function GamePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ edit?: string }>;
}) {
    const { id } = await params;
    const { edit } = await searchParams;

    if (edit === 'true') {
        const editData = await getGameEditData(id);
        if (!editData) return notFound();
        return (
            <>
                <BackButton />
                <EditGamePage gameId={id} initialTeams={editData.teams} />
            </>
        );
    }

    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/${id}`).then((r) => r.json());
    if ('error' in data) return notFound();

    return (
        <>
            <BackButton />
            <GameDetail data={data} />
        </>
    );
}
