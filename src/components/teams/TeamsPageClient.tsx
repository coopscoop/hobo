'use client';

import { getTeams } from '@/lib/db/queries/teams';
import { TeamsTable } from '@/components/teams/TeamsTable';
import { Search } from '@mui/icons-material';
import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Team } from '@/lib/types';

interface TeamsPageClientProps {
    teams: Team[];
}

export default function TeamsPageClient({ teams }: TeamsPageClientProps) {
    const [search, setSearch] = useState('');

    const filteredTeams = useMemo(() => {
        return teams.filter((t: any) => {
            if (search) {
                const full = `${t.teamName}`.toLowerCase();
                if (!full.includes(search.toLowerCase())) return false;
            }
            return true;
        });
    }, [search]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Teams</Typography>
            <OutlinedInput
                size="small"
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 300, ml: 2 }}
                startAdornment={
                    <InputAdornment position="start">
                        <Search fontSize="small" />
                    </InputAdornment>
                }
            />
            <TeamsTable teams={filteredTeams} />
        </Box>
    );
}
