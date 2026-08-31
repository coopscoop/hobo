'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export function DeleteGameButton({ gameId }: { gameId: number }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/games/${gameId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Failed to delete game');
            }

            router.push('/games');
        } catch (err) {
            console.error('Failed to delete game:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete game');
            setDeleting(false);
        }
    }

    return (
        <>
            <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpen(true)}
            >
                Delete Game
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Delete this game?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete the game and any attached
                        substitutes. This cannot be undone.
                    </DialogContentText>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
