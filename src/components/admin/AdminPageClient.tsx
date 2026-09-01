// src/components/admin/AdminPageClient.tsx
"use client";

import { Box, Tabs, Tab, Paper } from "@mui/material";
import { useQueryState } from "nuqs";
import AnnouncementsPanel from "@/components/admin/panels/AnnouncementsPanel";
import GamesPanel from "@/components/admin/panels/GamesPanel";
import PlayersPanel from "@/components/admin/panels/PlayersPanel";
import TeamsPanel from "@/components/admin/panels/TeamsPanel";
import PageContentsPanel from "@/components/admin/panels/PageContentsPanel";

const TABS = [
  { value: "announcements", label: "Announcements", Component: AnnouncementsPanel },
  { value: "games", label: "Games", Component: GamesPanel },
  { value: "players", label: "Players", Component: PlayersPanel },
  { value: "teams", label: "Teams", Component: TeamsPanel },
  { value: "page-contents", label: "Page Contents", Component: PageContentsPanel },
] as const;

export default function AdminPageClient() {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "announcements" });
  const active = TABS.find((t) => t.value === tab) ?? TABS[0];
  const ActivePanel = active.Component;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={active.value} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", p: 2 }}>
        <ActivePanel />
      </Box>
    </Box>
  );
}
