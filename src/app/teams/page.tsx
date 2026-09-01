import TeamsPageClient from '@/components/teams/TeamsPageClient';
import { fetchStandings } from '@/lib/services/standings';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default async function TeamsPage() {


    const [ teams ] = await Promise.all([ fetchStandings() ]);

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Teams</Typography>
            </Box>
            <TeamsPageClient teams={teams} />
            )
        </div>
    )
}
