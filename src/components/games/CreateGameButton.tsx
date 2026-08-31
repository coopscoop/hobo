'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export function CreateGameButton() {
    return (
        <Button
            component={Link}
            href="/games/create"
            variant="contained"
            startIcon={<AddIcon />}
        >
            Schedule Game
        </Button>
    );
}
