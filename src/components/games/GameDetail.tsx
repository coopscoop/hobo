'use client';

import type { GameDetail } from '@/types';
import {
  Box, Typography, Chip, Stack,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper
} from '@mui/material';
import { BattingSection } from './BattingSection';

type GameData = NonNullable<GameDetail>;

interface GameDetailProps {
  data: GameData;
}

export function GameDetail({ data }: GameDetailProps) {
  const { game, batting, innings } = data;

  const homeBatting = batting.filter((b) => b.teamId === game.homeTeam.id);
  const awayBatting = batting.filter((b) => b.teamId === game.awayTeam.id);

  console.log("game data: ", game);
  console.log("batting data: ", batting);
  console.log("inning data: ", innings);

  return (
    <Box sx={{ p: 2, margin: '0 auto' }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {game.homeTeam.name} vs {game.awayTeam.name}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">{game.date}</Typography>
          <Typography variant="body2" color="text.secondary">{game.location}</Typography>
          <Typography variant="body2" color="text.secondary">{game.league.name}</Typography>
          {game.isPlayoff && <Chip label="Playoff" size="small" color="primary" />}
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
