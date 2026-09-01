import { getAnnouncementById } from '@/lib/db/queries/announcements';
import { notFound } from 'next/navigation';
import { Box, Chip, Typography } from '@mui/material';
import { BackButton } from '@/components/BackButton';

export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const announcement = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${id}`).then((r) => r.json());

    return (
        <>
            <BackButton />
            <Box sx={{ p: 2, maxWidth: 900, margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom>{announcement.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{announcement.date}</Typography>
                    <Chip label={announcement.type} size="small" />
                </Box>
                {/* Rendered as plain text (no dangerouslySetInnerHTML) to close the stored-XSS
                    risk until the admin panel is behind auth. Old HTML-content announcements
                    will show raw tags until the content migration/cleanup pass. */}
                <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {announcement.content ?? ''}
                </Typography>
            </Box>
        </>
    );
}
