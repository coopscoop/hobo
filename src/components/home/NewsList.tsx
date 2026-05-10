'use client'; // the <List/> component requires a client-side component

import Link from 'next/link';
import {
  Typography, List, ListItem, ListItemText,
  ListItemButton, Paper, Box
} from '@mui/material';
import type { Announcement } from '@/types';

interface NewsListProps {
  title: string;
  announcements: Announcement[];
  emptyMessage?: string;
}

export function NewsList({ title, announcements, emptyMessage }: NewsListProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Paper>
        {announcements.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {emptyMessage ?? `No ${title.toLowerCase()}`}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {announcements.map((a, i) => (
              <ListItem
                key={a.id}
                disablePadding
                divider={i < announcements.length - 1}
              >
                <ListItemButton component={Link} href={`/announcements/${a.id}`}>
                  <ListItemText
                    primary={a.title}
                    secondary={a.date}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </>
  );
}
