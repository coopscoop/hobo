import { BackButton } from '@/components/BackButton';
import EditablePage from '@/components/editor/EditablePage'

export default async function HallOfFamePage() {
    return (
        <>
            <BackButton />
            <EditablePage pageName="contact" />
        </>
    );
}
