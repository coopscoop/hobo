'use client';

import type { GameDetail } from '@/types';
import {
    Box, Typography, Chip, Stack,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper
} from '@mui/material';
import { BattingSection } from './BattingSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type GameData = NonNullable<GameDetail>;

interface GameDetailProps {
    data: GameData;
}

export function GameDetail({ data }: GameDetailProps) {
    const { game, batting, innings } = data;
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const homeBatting = batting.filter((b) => b.teamId === game.homeTeam.id);
    const awayBatting = batting.filter((b) => b.teamId === game.awayTeam.id);

    async function handleDelete() {
        if (!confirm('Delete this game? This cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(body.error ?? 'Failed to delete game');
                setDeleting(false);
                return;
            }
            router.push('/games');
        } catch (err) {
            console.error('Failed to delete game', err);
            alert('Failed to delete game');
            setDeleting(false);
        }
    }

    return (
        <Box sx={{ p: 2, margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {game.homeTeam.name} vs {game.awayTeam.name}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Chip label={game.date} size="small" />
                    <Chip label={game.location} size="small" />
                    <Chip label={game.league.name} size="small" />
                    {game.isPlayoff && <Chip label="Playoff" size="small" color="primary" />}
                    <Link href={`/games/${game.id}?edit=true`}>
                        <Chip label="Edit Score Sheet" size="small" color="secondary" clickable />
                    </Link>
                    <Chip
                        label={deleting ? 'Deleting…' : 'Delete Game'}
                        size="small"
                        color="error"
                        clickable
                        disabled={deleting}
                        onClick={handleDelete}
                    />
                </Stack>
            </Box>
            {/* Score */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={4}>
                    <Typography variant="h6">{game.homeTeam.name}: {game.homeScore ?? '—'}</Typography>
                    <Typography variant="h6">{game.awayTeam.name}: {game.awayScore ?? '—'}</Typography>
                </Stack>
            </Box>

            {/* Innings */}
            {innings.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Innings</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Team</TableCell>
                                    {innings.map((i) => (
                                        <TableCell key={`header-${i.inning}`} align="center">{i.inning}</TableCell>
                                    ))}
                                    <TableCell align="center">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{game.homeTeam.name}</TableCell>
                                    {innings.map((i) => (
                                        <TableCell key={`home-${i.inning}`} align="center">{i.homeRuns}</TableCell>
                                    ))}
                                    <TableCell align="center">{game.homeScore}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{game.awayTeam.name}</TableCell>
                                    {innings.map((i) => (
                                        <TableCell key={`away-${i.inning}`} align="center">{i.awayRuns}</TableCell>
                                    ))}
                                    <TableCell align="center">{game.awayScore}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Batting — side by side */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <BattingSection title={`${game.homeTeam.name} Batting`} batting={homeBatting} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <BattingSection title={`${game.awayTeam.name} Batting`} batting={awayBatting} />
                </Box>
            </Stack>

            {game.notes && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">{game.notes}</Typography>
                </Box>
            )}
        </Box>
    );
}
