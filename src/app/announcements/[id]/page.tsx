// app/announcements/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Box, Chip, Typography } from '@mui/material';
import { BackButton } from '@/components/BackButton';
import { fetchAnnouncementById } from '@/lib/services/announcements';

export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let announcement;
    try {
        announcement = await fetchAnnouncementById(Number(id));
    } catch {
        return notFound();
    }

    return (
        <>
            <BackButton />
            <Box sx={{ p: 2, maxWidth: 900, margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom>{announcement.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{announcement.date}</Typography>
                    <Chip label={announcement.type} size="small" />
                </Box>
                <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {announcement.content ?? ''}
                </Typography>
            </Box>
        </>
    );
}
