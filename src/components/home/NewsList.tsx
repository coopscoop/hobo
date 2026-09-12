'use client';

import Link from 'next/link';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Box,
} from '@mui/material';
import type { Announcement } from '@/types';

interface NewsListProps {
  title: string;
  announcements: Announcement[];
  emptyMessage?: string;
  showBody?: boolean;
}

export function NewsList({
  title,
  announcements,
  emptyMessage,
  showBody = false,
}: NewsListProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

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
                <ListItemButton
                  component={Link}
                  href={`/announcements/${a.id}`}
                  sx={{
                    borderLeft: '3px solid transparent',
                    '&:hover': {
                      borderLeftColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={a.title}
                    secondary={
                      showBody ? (
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {a.content}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 1 }}
                          >
                            {a.date}
                          </Typography>
                        </>
                      ) : (
                        a.date
                      )
                    }
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
