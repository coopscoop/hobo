import {
  Typography, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper
} from '@mui/material';
import type { GameListItem } from '@/types';
import { useRouter } from 'next/navigation';

export function UpcomingGamesTable({ games }: { games: GameListItem[] }) {

  const router = useRouter();

  return (
    <>
      <Typography variant="h6" gutterBottom>Upcoming Games</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Home</TableCell>
              <TableCell>Away</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No upcoming games</TableCell>
              </TableRow>
            ) : (
              games.map((g) => (
                <TableRow
                  key={g.id}
                  onClick={() => router.push(`/games/${g.id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{g.date}</TableCell>
                  <TableCell>{g.homeTeam.name}</TableCell>
                  <TableCell>{g.awayTeam.name}</TableCell>
                  <TableCell>{g.location}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
