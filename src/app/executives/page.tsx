import { getExecutives } from '@/db/queries/executives';
import { ExecutivesTable } from '@/components/executives/ExecutivesTable';
import { BackButton } from '@/components/BackButton';

export default async function ExecutivesPage() {
  const data = await getExecutives();
  return (
    <>
      <BackButton />
      <ExecutivesTable executives={data} />
    </>
  );
}
