import { getAnnouncementById } from '@/db/queries/announcements';
import { notFound } from 'next/navigation';
import { Box, Chip, Typography } from '@mui/material';
import { BackButton } from '@/components/BackButton';

export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncementById(parseInt(id));
  if (!announcement) notFound();

  return (
    <>
      <BackButton />
      <Box sx={{ p: 2, maxWidth: 900, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom>{announcement.title}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">{announcement.date}</Typography>
          <Chip label={announcement.type} size="small" />
        </Box>
        {/* probably sanitize/rework these old announcements */}
        <div dangerouslySetInnerHTML={{ __html: announcement.content ?? '' }} />
      </Box>
    </>
  );
}
