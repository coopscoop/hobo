import { Box, TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell, Typography, Link } from '@mui/material';
import type { GameDetail } from '@/types';

type GameData = NonNullable<GameDetail>;
const BATTING_HEADERS = ['Player', 'AB', 'R', 'H', '1B', '2B', '3B', 'HR', 'RBI', 'BB', 'K', 'HBP', 'SB', 'ROE'];

export function BattingSection({ title, batting }: { title: string; batting: GameData['batting'] }) {
  if (batting.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table size="small" sx={{ '& .MuiTableCell-root': { px: 1 } }}>
          <TableHead>
            <TableRow>
              {BATTING_HEADERS.map((h) => (
                <TableCell key={h} align={h === 'Player' ? 'left' : 'center'}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {batting.map((b) => (
              <TableRow key={b.playerId}>
                <TableCell>
                  <Link href={`/players/${b.playerId}`} style={{ textDecoration: 'none' }}>
                    {b.firstName} {b.lastName}
                  </Link>
                </TableCell>
                <TableCell align="center">{b.atBat}</TableCell>
                <TableCell align="center">{b.run}</TableCell>
                <TableCell align="center">{(b.single ?? 0) + (b.double ?? 0) + (b.triple ?? 0) + (b.homeRun ?? 0)}</TableCell>
                <TableCell align="center">{b.single}</TableCell>
                <TableCell align="center">{b.double}</TableCell>
                <TableCell align="center">{b.triple}</TableCell>
                <TableCell align="center">{b.homeRun}</TableCell>
                <TableCell align="center">{b.rbi}</TableCell>
                <TableCell align="center">{b.walk}</TableCell>
                <TableCell align="center">{b.strikeout}</TableCell>
                <TableCell align="center">{b.hitByPitch}</TableCell>
                <TableCell align="center">{b.stolenBase}</TableCell>
                <TableCell align="center">{b.roe}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
