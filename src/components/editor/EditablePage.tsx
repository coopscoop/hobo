'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import '@mdxeditor/editor/style.css';
import styles from './EditablePage.module.css';

const Editor = dynamic(() => import('./InitializedEditor'), { ssr: false });

interface PageContent {
    id: number;
    pageName: string;
    content: string;
}

export default function EditablePage({ pageName }: { pageName: string }) {
    const [page, setPage] = useState<PageContent | null>(null);
    const [draft, setDraft] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/pages/name/${pageName}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load page content.');
                return res.json();
            })
            .then((data: PageContent) => {
                if (!cancelled) {
                    setPage(data);
                    setDraft(data.content);
                }
            })
            .catch((err) => !cancelled && setError(err.message));
        return () => {
            cancelled = true;
        };
    }, [pageName]);

    const handleSave = useCallback(async () => {
        if (!page) return;
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/pages/${page.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: draft }),
            });
            if (!res.ok) throw new Error('Failed to save changes.');
            const updated: PageContent = await res.json();
            setPage(updated);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error saving content.');
        } finally {
            setIsSaving(false);
        }
    }, [page, draft]);

    const handleCancel = () => {
        if (page) setDraft(page.content);
        setError(null);
        setIsEditing(false);
    };

    if (!page) {
        return error ? <p>{error}</p> : <p>Loading…</p>;
    }

    return (
        <div>
            <Editor
                key={isEditing ? 'edit' : 'view'}
                markdown={isEditing ? draft : page.content}
                readOnly={!isEditing}
                onChange={isEditing ? setDraft : undefined}
            />
        </div>
    );
}
