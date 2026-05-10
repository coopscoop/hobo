import { getTeams } from '@/db/queries/teams';
import { TeamsTable } from '@/components/teams/TeamsTable';

export default async function TeamsPage() {
  const teams = await getTeams();
  return <TeamsTable teams={teams} />;
}
