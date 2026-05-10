import Link from 'next/link';
import {
  Typography, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper
} from '@mui/material';
import type { GameListItem } from '@/types';

export function RecentGamesTable({ games }: { games: GameListItem[] }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>Recent Results</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Home</TableCell>
              <TableCell>Away</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No recent games</TableCell>
              </TableRow>
            ) : (
              games.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.date}</TableCell>
                  <TableCell>{g.homeTeam.name}</TableCell>
                  <TableCell>{g.awayTeam.name}</TableCell>
                  <TableCell>
                    <Link href={`/games/${g.id}`}>
                      {g.homeScore} - {g.awayScore}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
