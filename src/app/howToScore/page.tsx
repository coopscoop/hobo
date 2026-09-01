import { BackButton } from '@/components/BackButton';
import EditablePage from '@/components/editor/EditablePage'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default async function HowToScorePage() {
    return (
        <>
            <Box sx={{ px: 4, py: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">How to Score</Typography>
            </Box>
            <EditablePage pageName="howToScore" />
        </>
    );
}
