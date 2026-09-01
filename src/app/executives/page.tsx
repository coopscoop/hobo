import { getExecutives } from '@/lib/db/queries/executives';
import { ExecutivesTable } from '@/components/executives/ExecutivesTable';

export default async function ExecutivesPage() {
  const data = await getExecutives();
  return (
    <>
      <ExecutivesTable executives={data} />
    </>
  );
}
