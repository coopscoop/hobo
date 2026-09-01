// src/components/admin/MdxEditModal.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "@mdxeditor/editor/style.css";
import EditModal from "@/components/admin/EditModal";

const Editor = dynamic(() => import("@/components/editor/InitializedEditor"), { ssr: false });

interface MdxEditModalProps {
  open: boolean;
  title: string;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => Promise<void> | void;
}

export default function MdxEditModal({ open, title, initialContent, onClose, onSave }: MdxEditModalProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(content);
    setSaving(false);
  };

  return (
    <EditModal open={open} title={title} onClose={onClose} onSave={handleSave} saving={saving} maxWidth="md">
      <Editor key={initialContent} markdown={content} onChange={setContent} readOnly={false} />
    </EditModal>
  );
}
