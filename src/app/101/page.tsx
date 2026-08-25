import { BackButton } from '@/components/BackButton';
import EditablePage from '@/components/editor/EditablePage'

export default async function NewPlayersInfoPage() {
    return (
        <>
            <BackButton />
            <EditablePage pageName="101" />
        </>
    );
}
