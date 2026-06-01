import TeamsPageClient from '@/components/teams/TeamsPageClient';

export default async function TeamsPage() {

    const [teams] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`).then((r) => r.json()),
    ]);

    return (
        <TeamsPageClient teams={teams} />
    );
}
