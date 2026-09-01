// src/components/admin/AdminPageClient.tsx
"use client";

import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useQueryState } from "nuqs";
import AnnouncementsPanel from "@/components/admin/panels/AnnouncementsPanel";
import GamesPanel from "@/components/admin/panels/GamesPanel";
import PlayersPanel from "@/components/admin/panels/PlayersPanel";
import TeamsPanel from "@/components/admin/panels/TeamsPanel";
import PageContentsPanel from "@/components/admin/panels/PageContentsPanel";

interface Props {
    initialAnnouncements: any[];
    initialGames: any[];
    initialPlayers: any[];
    initialTeams: any[];
    initialFields: any[];
    initialPages: any[];
}

export default function AdminPageClient({
    initialAnnouncements,
    initialGames,
    initialPlayers,
    initialTeams,
    initialFields,
    initialPages,
}: Props) {
    const [tab, setTab] = useQueryState("tab", { defaultValue: "announcements" });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                    <Tab value="announcements" label="Announcements" />
                    <Tab value="games" label="Games" />
                    <Tab value="players" label="Players" />
                    <Tab value="teams" label="Teams" />
                    <Tab value="page-contents" label="Page Contents" />
                </Tabs>
            </Paper>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", p: 2 }}>
                {tab === "announcements" && <AnnouncementsPanel initialData={initialAnnouncements} />}
                {tab === "games" && <GamesPanel initialData={initialGames} teams={initialTeams} fields={initialFields} />}
                {tab === "players" && <PlayersPanel initialData={initialPlayers} teams={initialTeams} />}
                {tab === "teams" && <TeamsPanel initialData={initialTeams} />}
                {tab === "page-contents" && <PageContentsPanel initialData={initialPages} />}
            </Box>
        </Box>
    );
}
