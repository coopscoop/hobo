import { BackButton } from '@/components/BackButton';
import EditablePage from '@/components/editor/EditablePage'

export default async function HowToScorePage() {
    return (
        <>
            <BackButton />
            <EditablePage pageName="howToScore" />
        </>
    );
}
