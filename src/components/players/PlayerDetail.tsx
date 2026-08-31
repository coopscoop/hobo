'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
    Box,
    Typography,
    Chip,
    Stack,
    Paper,
    Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import type {
    PlayerById,
    PlayerGameLog,
} from '@/types';

type Player = NonNullable<PlayerById>;

interface PlayerSeasonStats {
    year: number;
    teamName: string | null;

    gamesPlayed: number;
    atBat: number;
    run: number;
    walk: number;
    strikeout: number;
    hitByPitch: number;
    stolenBase: number;
    runsBattedIn: number;
    sacrifice: number;

    singleHit: number;
    doubleHit: number;
    tripleHit: number;
    homeRun: number;
    roe: number;
    hits: number;

    avg: number | null;
    obp: number | null;
    slg: number | null;
    ops: number | null;
}

interface PlayerDetailProps {
    player: Player;
    statsByYear: PlayerSeasonStats[];
    gameLog: PlayerGameLog;
    currentYear: number;
}

const formatRate = (value: number | string | null | undefined) =>
    value == null ? '--' : String(value);

const roundRate = (value: number | null) =>
    value === null ? null : Math.round(value * 1000) / 1000;

function StatStrip({
    stats,
}: {
    stats: { label: string; value: string | number }[];
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                width: 'fit-content',
                maxWidth: '100%',
            }}
        >
            <Stack
                direction="row"
                divider={
                    <Divider orientation="vertical" flexItem />
                }
                sx={{ overflowX: 'auto' }}
            >
                {stats.map(({ label, value }) => (
                    <Box
                        key={label}
                        sx={{
                            px: 2.5,
                            py: 1.5,
                            textAlign: 'center',
                            minWidth: 56,
                            flexShrink: 0,
                        }}
                    >
                        <Typography variant="caption">
                            {label}
                        </Typography>

                        <Typography variant="body1">
                            {value}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}

export function PlayerDetail({
    player,
    statsByYear,
    gameLog,
    currentYear,
}: PlayerDetailProps) {
    const router = useRouter();

    const currentSeason =
        statsByYear.find(
            (season) => season.year === currentYear,
        ) ?? null;

    // ---- Career totals ----

    const totalGP = statsByYear.reduce(
        (sum, season) => sum + Number(season.gamesPlayed ?? 0),
        0,
    );

    const totalAB = statsByYear.reduce(
        (sum, season) => sum + Number(season.atBat ?? 0),
        0,
    );

    const totalRuns = statsByYear.reduce(
        (sum, season) => sum + Number(season.run ?? 0),
        0,
    );

    const totalHits = statsByYear.reduce(
        (sum, season) => sum + Number(season.hits ?? 0),
        0,
    );

    const total1B = statsByYear.reduce(
        (sum, season) => sum + Number(season.singleHit ?? 0),
        0,
    );

    const total2B = statsByYear.reduce(
        (sum, season) => sum + Number(season.doubleHit ?? 0),
        0,
    );

    const total3B = statsByYear.reduce(
        (sum, season) => sum + Number(season.tripleHit ?? 0),
        0,
    );

    const totalHR = statsByYear.reduce(
        (sum, season) => sum + Number(season.homeRun ?? 0),
        0,
    );

    const totalRBI = statsByYear.reduce(
        (sum, season) => sum + Number(season.runsBattedIn ?? 0),
        0,
    );

    const totalBB = statsByYear.reduce(
        (sum, season) => sum + Number(season.walk ?? 0),
        0,
    );

    const totalK = statsByYear.reduce(
        (sum, season) => sum + Number(season.strikeout ?? 0),
        0,
    );

    const totalSB = statsByYear.reduce(
        (sum, season) => sum + Number(season.stolenBase ?? 0),
        0,
    );

    const totalHBP = statsByYear.reduce(
        (sum, season) => sum + Number(season.hitByPitch ?? 0),
        0,
    );

    const totalSacrifice = statsByYear.reduce(
        (sum, season) => sum + Number(season.sacrifice ?? 0),
        0,
    );

    const careerAVG =
        totalAB > 0
            ? roundRate(totalHits / totalAB)
            : null;

    const careerOBP =
        totalAB + totalBB + totalHBP + totalSacrifice > 0
            ? roundRate(
                (totalHits + totalBB + totalHBP) /
                (totalAB + totalBB + totalHBP + totalSacrifice)
            )
            : null;

    const careerSLG =
        totalAB > 0
            ? roundRate(
                (total1B + total2B * 2 + total3B * 3 + totalHR * 4) /
                totalAB
            )
            : null;

    const careerOPS =
        careerOBP !== null && careerSLG !== null
            ? roundRate(careerOBP + careerSLG)
            : null;

    const careerStats = [
        { label: 'GP', value: totalGP },
        { label: 'AB', value: totalAB },
        { label: 'H', value: totalHits },
        { label: 'HR', value: totalHR },
        { label: 'RBI', value: totalRBI },
        { label: 'R', value: totalRuns },
        { label: 'BB', value: totalBB },
        { label: 'K', value: totalK },
        { label: 'SB', value: totalSB },
        { label: 'AVG', value: formatRate(careerAVG) },
        { label: 'OBP', value: formatRate(careerOBP) },
        { label: 'SLG', value: formatRate(careerSLG) },
        { label: 'OPS', value: formatRate(careerOPS) },
    ];

    // ---- Current season ----

    const currentSeasonStats = currentSeason
        ? [
            { label: 'GP', value: currentSeason.gamesPlayed },
            { label: 'AB', value: currentSeason.atBat },
            { label: 'H', value: currentSeason.hits },
            { label: 'HR', value: currentSeason.homeRun },
            { label: 'RBI', value: currentSeason.runsBattedIn },
            { label: 'R', value: currentSeason.run },
            { label: 'BB', value: currentSeason.walk },
            { label: 'K', value: currentSeason.strikeout },
            { label: 'SB', value: currentSeason.stolenBase },
            { label: 'AVG', value: formatRate(currentSeason.avg) },
            { label: 'OBP', value: formatRate(currentSeason.obp) },
            { label: 'SLG', value: formatRate(currentSeason.slg) },
            { label: 'OPS', value: formatRate(currentSeason.ops) },
        ]
        : null;

    // ---- Game log ----

    const gameLogRows = gameLog.map((game) => {
        const opponent =
            game.playerTeamId === game.homeTeamId
                ? game.awayTeamName
                : game.homeTeamName;

        return {
            id: game.gameId,
            date: game.date,
            playerTeam: game.playerTeam ?? '—',
            opponent: opponent ?? '—',
            atBat: game.atBat ?? 0,
            run: game.run ?? 0,
            hits:
                (game.singleHit ?? 0) +
                (game.doubleHit ?? 0) +
                (game.tripleHit ?? 0) +
                (game.homeRun ?? 0),
            singles: game.singleHit ?? 0,
            doubles: game.doubleHit ?? 0,
            triples: game.tripleHit ?? 0,
            homeRuns: game.homeRun ?? 0,
            rbi: game.runsBattedIn ?? 0,
            walks: game.walk ?? 0,
            strikeouts: game.strikeout ?? 0,
            hitByPitch: game.hitByPitch ?? 0,
            stolenBases: game.stolenBase ?? 0,
            roe: game.roe ?? 0,
            sacrifice: game.sacrifice ?? 0,
        };
    });

    const gameLogColumns: GridColDef[] = [
        { field: 'date', headerName: 'Date', width: 110 },
        { field: 'playerTeam', headerName: 'Team', flex: 0.8 },
        { field: 'opponent', headerName: 'Opponent', flex: 0.8 },
        { field: 'atBat', headerName: 'AB', flex: 0.5, type: 'number' },
        { field: 'run', headerName: 'R', flex: 0.5, type: 'number' },
        { field: 'hits', headerName: 'H', flex: 0.5, type: 'number' },
        { field: 'singles', headerName: '1B', flex: 0.5, type: 'number' },
        { field: 'doubles', headerName: '2B', flex: 0.5, type: 'number' },
        { field: 'triples', headerName: '3B', flex: 0.5, type: 'number' },
        { field: 'homeRuns', headerName: 'HR', flex: 0.5, type: 'number' },
        { field: 'rbi', headerName: 'RBI', flex: 0.5, type: 'number' },
        { field: 'walks', headerName: 'BB', flex: 0.5, type: 'number' },
        { field: 'strikeouts', headerName: 'K', flex: 0.5, type: 'number' },
        { field: 'hitByPitch', headerName: 'HBP', flex: 0.5, type: 'number' },
        { field: 'stolenBases', headerName: 'SB', flex: 0.5, type: 'number' },
        { field: 'roe', headerName: 'ROE', flex: 0.5, type: 'number' },
        { field: 'sacrifice', headerName: 'SAC', flex: 0.5, type: 'number' },
    ];

    // ---- Year by year ----

    const careerRows = statsByYear.map((season) => ({
        id: season.year,
        year: season.year,
        teamName: season.teamName ?? '—',
        gamesPlayed: season.gamesPlayed,
        atBat: season.atBat,
        run: season.run,
        hits: season.hits,
        singles: season.singleHit,
        doubles: season.doubleHit,
        triples: season.tripleHit,
        homeRuns: season.homeRun,
        rbi: season.runsBattedIn,
        walks: season.walk,
        strikeouts: season.strikeout,
        hitByPitch: season.hitByPitch,
        stolenBases: season.stolenBase,
        roe: season.roe,
        avg: formatRate(season.avg),
        obp: formatRate(season.obp),
        slg: formatRate(season.slg),
        ops: formatRate(season.ops),
    }));

    const careerColumns: GridColDef[] = [
        { field: 'year', headerName: 'Year', flex: 0.7, type: 'number' },
        { field: 'teamName', headerName: 'Team', flex: 0.8 },
        { field: 'gamesPlayed', headerName: 'GP', flex: 0.5, type: 'number' },
        { field: 'atBat', headerName: 'AB', flex: 0.5, type: 'number' },
        { field: 'run', headerName: 'R', flex: 0.5, type: 'number' },
        { field: 'hits', headerName: 'H', flex: 0.5, type: 'number' },
        { field: 'singles', headerName: '1B', flex: 0.5, type: 'number' },
        { field: 'doubles', headerName: '2B', flex: 0.5, type: 'number' },
        { field: 'triples', headerName: '3B', flex: 0.5, type: 'number' },
        { field: 'homeRuns', headerName: 'HR', flex: 0.5, type: 'number' },
        { field: 'rbi', headerName: 'RBI', flex: 0.5, type: 'number' },
        { field: 'walks', headerName: 'BB', flex: 0.5, type: 'number' },
        { field: 'strikeouts', headerName: 'K', flex: 0.5, type: 'number' },
        { field: 'hitByPitch', headerName: 'HBP', flex: 0.5, type: 'number' },
        { field: 'stolenBases', headerName: 'SB', flex: 0.5, type: 'number' },
        { field: 'roe', headerName: 'ROE', flex: 0.5, type: 'number' },
        { field: 'avg', headerName: 'AVG', flex: 0.6 },
        { field: 'obp', headerName: 'OBP', flex: 0.6 },
        { field: 'slg', headerName: 'SLG', flex: 0.6 },
        { field: 'ops', headerName: 'OPS', flex: 0.6 },
    ];

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}
        >
            <Box>
                <Typography variant="h4" gutterBottom>
                    {player.firstName} {player.lastName}
                </Typography>

                {player.currentTeamName && (
                    <Chip
                        label={player.currentTeamName}
                        size="small"
                    />
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    {currentYear} Season
                </Typography>

                {currentSeasonStats ? (
                    <StatStrip stats={currentSeasonStats} />
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        No data for the {currentYear} season.
                    </Typography>
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    {currentYear} Game Log
                </Typography>

                <DataGrid
                    rows={gameLogRows}
                    columns={gameLogColumns}
                    rowHeight={52}
                    scrollbarSize={0}
                    initialState={{
                        sorting: {
                            sortModel: [
                                { field: 'date', sort: 'desc' },
                            ],
                        },
                        pagination: {
                            paginationModel: { pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    onRowClick={(params) => {
                        router.push(`/games/${params.row.id}`);
                    }}
                    sx={{ cursor: 'pointer' }}
                    autoHeight
                />
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Career Stats
                </Typography>

                {statsByYear.length > 0 ? (
                    <StatStrip stats={careerStats} />
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        No career data available.
                    </Typography>
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Year-by-Year
                </Typography>

                <DataGrid
                    rows={careerRows}
                    columns={careerColumns}
                    rowHeight={52}
                    scrollbarSize={0}
                    initialState={{
                        sorting: {
                            sortModel: [
                                { field: 'year', sort: 'desc' },
                            ],
                        },
                        pagination: {
                            paginationModel: { pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    autoHeight
                />
            </Box>
        </Box>
    );
}
