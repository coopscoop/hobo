import { BackButton } from '@/components/BackButton';
import EditablePage from '@/components/editor/EditablePage'

export default async function RulesPage() {
    return (
        <>
            <BackButton />
            <EditablePage pageName="rules" />
        </>
    );
}
