'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

type Team = {
    id: number;
    teamName: string;
};

type Field = {
    id: number;
    name: string;
    address: string | null;
};

export default function CreateGamePage() {
    const router = useRouter();

    const [teams, setTeams] = useState<Team[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);

    const [homeTeamId, setHomeTeamId] = useState<number | ''>('');
    const [awayTeamId, setAwayTeamId] = useState<number | ''>('');
    const [fieldId, setFieldId] = useState<number | ''>('');
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [time, setTime] = useState<Dayjs | null>(dayjs().hour(9).minute(0));

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        async function loadOptions() {
            try {
                const [teamsRes, fieldsRes] = await Promise.all([
                    fetch('/api/teams'),
                    fetch('/api/fields'),
                ]);

                if (!teamsRes.ok || !fieldsRes.ok) {
                    throw new Error('Failed to load teams or fields');
                }

                const teamsData = await teamsRes.json();
                const fieldsData = await fieldsRes.json();

                setTeams(teamsData);
                setFields(fieldsData);
            } catch (err) {
                console.error('Failed to load create-game options:', err);
                setOptionsError('Failed to load teams/fields. Try refreshing the page.');
            } finally {
                setLoadingOptions(false);
            }
        }

        loadOptions();
    }, []);

    function validate(): string | null {
        if (!homeTeamId || !awayTeamId || !fieldId || !date) {
            return 'All fields are required.';
        }
        if (homeTeamId === awayTeamId) {
            return 'Home and away teams must be different.';
        }
        return null;
    }

    async function submitGame(): Promise<number | null> {
        const validationError = validate();
        if (validationError) {
            setSubmitError(validationError);
            return null;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    homeTeamId,
                    awayTeamId,
                    fieldId,
                    date: date!.format('YYYY-MM-DD'),
                    time: time ? time.format('HH:mm:ss') : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || data?.error || 'Failed to create game');
            }

            return data.id;
        } catch (err) {
            console.error('Failed to create game:', err);
            setSubmitError(
                err instanceof Error ? err.message : 'Failed to create game'
            );
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSaveOnly() {
        const newId = await submitGame();
        if (newId) {
            router.push('/games');
        }
    }

    async function handleSaveAndEdit() {
        const newId = await submitGame();
        if (newId) {
            router.push(`/games/${newId}`);
        }
    }

    if (loadingOptions) {
        return (
            <Box>
                <CircularProgress />
            </Box>
        );
    }

    if (optionsError) {
        return (
            <Box>
                <Alert severity="error">{optionsError}</Alert>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5">
                        Schedule a Game
                    </Typography>

                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Home Team"
                            value={homeTeamId}
                            onChange={(e) => setHomeTeamId(Number(e.target.value))}
                            fullWidth
                        >
                            {teams.map((team) => (
                                <MenuItem key={team.id} value={team.id}>
                                    {team.teamName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Away Team"
                            value={awayTeamId}
                            onChange={(e) => setAwayTeamId(Number(e.target.value))}
                            fullWidth
                        >
                            {teams.map((team) => (
                                <MenuItem key={team.id} value={team.id}>
                                    {team.teamName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Field"
                            value={fieldId}
                            onChange={(e) => setFieldId(Number(e.target.value))}
                            fullWidth
                        >
                            {fields.map((field) => (
                                <MenuItem key={field.id} value={field.id}>
                                    {field.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <DatePicker
                            label="Date"
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                        />

                        <TimePicker
                            label="Start Time"
                            value={time}
                            onChange={(newValue) => setTime(newValue)}
                        />

                        {submitError && <Alert severity="error">{submitError}</Alert>}

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={handleSaveOnly}
                                disabled={submitting}
                            >
                                Save
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveAndEdit}
                                disabled={submitting}
                            >
                                Save &amp; Edit
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
}
