import { NextResponse } from 'next/server'
import { getLeagueById, updateLeague, deleteLeague } from '@/lib/db/queries/leagues'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const data = await getLeagueById(Number(id))
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const body = await request.json()
    const [league] = await updateLeague(Number(id), body)

    return NextResponse.json(league)
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    await deleteLeague(Number(id))
    return new NextResponse(null, { status: 204 })
}
