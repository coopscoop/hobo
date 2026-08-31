'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import type { PlayerWithStats } from '@/lib/types';

interface PlayersTableProps {
    players: PlayerWithStats[];
}

const formatRate = (value: number | null) => {
    if (value == null) return '—';

    return value;
};

const columns: GridColDef<PlayerWithStats>[] = [
    {
        field: 'name',
        headerName: 'Player',
        flex: 1.5,
        valueGetter: (_, row) =>
            `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
    },
    {
        field: 'currentTeamName',
        headerName: 'Team',
        flex: 1,
        valueGetter: (_, row) => row.currentTeamName ?? '--'
    },
    {
        field: 'gamesPlayed',
        headerName: 'GP',
        type: 'number',
        width: 70,
    },
    {
        field: 'atBat',
        headerName: 'AB',
        type: 'number',
        width: 70,
    },
    {
        field: 'run',
        headerName: 'R',
        type: 'number',
        width: 70,
    },
    {
        field: 'hits',
        headerName: 'H',
        type: 'number',
        width: 70,
    },
    {
        field: 'doubleHit',
        headerName: '2B',
        type: 'number',
        width: 70,
    },
    {
        field: 'tripleHit',
        headerName: '3B',
        type: 'number',
        width: 70,
    },
    {
        field: 'homeRun',
        headerName: 'HR',
        type: 'number',
        width: 70,
    },
    {
        field: 'runsBattedIn',
        headerName: 'RBI',
        type: 'number',
        width: 70,
    },
    {
        field: 'walk',
        headerName: 'BB',
        type: 'number',
        width: 70,
    },
    {
        field: 'strikeout',
        headerName: 'K',
        type: 'number',
        width: 70,
    },
    {
        field: 'stolenBase',
        headerName: 'SB',
        type: 'number',
        width: 70,
    },
    {
        field: 'avg',
        headerName: 'AVG',
        width: 80,
        valueFormatter: (value) => formatRate(value),
    },
    {
        field: 'obp',
        headerName: 'OBP',
        width: 80,
        valueFormatter: (value) => formatRate(value),
    },
    {
        field: 'slg',
        headerName: 'SLG',
        width: 80,
        valueFormatter: (value) => formatRate(value),
    },
    {
        field: 'ops',
        headerName: 'OPS',
        width: 80,
        valueFormatter: (value) => formatRate(value),
    },
];

export function PlayersTable({ players }: PlayersTableProps) {
    const router = useRouter();

    return (
        <DataGrid
            rows={players}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 10,
                    },
                },
            }}
            pageSizeOptions={[10, 15, 25]}
            disableRowSelectionOnClick
            onRowClick={(params) =>
                router.push(`/players/${params.row.id}`)
            }
            sx={{ cursor: 'pointer' }}
            autoHeight
        />
    );
}
