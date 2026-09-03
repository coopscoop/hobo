import { useRouter } from 'next/navigation';
import {
  Typography, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper, Box
} from '@mui/material';
import type { TeamWithPlayers } from '@/lib/types';

function pct(wins: number, losses: number, ties: number) {
  const decisions = wins + losses + ties;
  if (decisions === 0) return 0;
  return (wins + ties * 0.5) / decisions;
}

export function TeamStandings({ teams }: { teams: TeamWithPlayers[] }) {
  const router = useRouter();

  const ranked = [...teams]
    .map((t) => ({
      ...t,
      wins: Number(t.wins) || 0,
      losses: Number(t.losses) || 0,
      ties: Number(t.ties) || 0,
    }))
    .sort((a, b) => pct(b.wins, b.losses, b.ties) - pct(a.wins, a.losses, a.ties)).splice(0,6);

  return (
    <>
      <Typography variant="h6" gutterBottom>Standings</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell align="right">W</TableCell>
              <TableCell align="right">L</TableCell>
              <TableCell align="right">T</TableCell>
              <TableCell align="right">PCT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranked.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No teams yet</TableCell>
              </TableRow>
            ) : (
              ranked.map((t, i) => (
                <TableRow
                  key={t.id}
                  onClick={() => router.push(`/teams/${t.id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderLeft: '3px solid',
                    borderLeftColor: i === 0 ? 'primary.main' : 'transparent',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', width: 16 }}>
                        {i + 1}
                      </Typography>
                      {t.teamName}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{t.wins}</TableCell>
                  <TableCell align="right">{t.losses}</TableCell>
                  <TableCell align="right">{t.ties}</TableCell>
                  <TableCell align="right">{pct(t.wins, t.losses, t.ties).toFixed(3).replace(/^0/, '')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
