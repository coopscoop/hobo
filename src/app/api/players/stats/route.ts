import { getPlayers } from '@/lib/db/queries/players';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearFrom = searchParams.get('yearFrom') ?? '2015';
        const yearTo = searchParams.get('yearTo') ?? String(new Date().getFullYear());

        if (yearFrom > yearTo) {
            return NextResponse.json({ message: 'yearFrom must be less than or equal to yearTo' }, { status: 400 });
        }

        const players = await getPlayers({
            yearFrom: yearFrom,
            yearTo: yearTo,
        });

        return NextResponse.json(players, { status: 200 });
    } catch (error) {
        return NextResponse.json([], { status: 400 });
    }
}
