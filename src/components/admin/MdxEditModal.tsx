// src/components/admin/MdxEditModal.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TextField, Stack, Box, Switch, FormControlLabel } from "@mui/material";
import "@mdxeditor/editor/style.css";
import EditModal from "@/components/admin/EditModal";

const Editor = dynamic(() => import("@/components/editor/InitializedEditor"), { ssr: false });

interface MdxEditModalProps {
  open: boolean;
  title: string; // modal chrome title (e.g. "Edit Announcement")
  initialTitle: string;
  initialContent: string;
  initialPinned?: boolean; // omit entirely for entities with no pinned concept (e.g. page contents)
  onClose: () => void;
  onSave: (values: { title: string; content: string; pinned?: boolean }) => Promise<void> | void;
}

export default function MdxEditModal({
  open,
  title,
  initialTitle,
  initialContent,
  initialPinned,
  onClose,
  onSave,
}: MdxEditModalProps) {
  const [entityTitle, setEntityTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [pinned, setPinned] = useState(initialPinned ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title: entityTitle,
      content,
      ...(initialPinned !== undefined && { pinned }),
    });
    setSaving(false);
  };

  return (
    <EditModal open={open} title={title} onClose={onClose} onSave={handleSave} saving={saving} maxWidth="md">
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Title"
            value={entityTitle}
            onChange={(e) => setEntityTitle(e.target.value)}
            fullWidth
            autoFocus
          />
          {initialPinned !== undefined && (
            <FormControlLabel
              control={<Switch checked={pinned} onChange={(e) => setPinned(e.target.checked)} />}
              label="Pinned"
              sx={{ whiteSpace: "nowrap" }}
            />
          )}
        </Box>
        <Editor key={initialContent} markdown={content} onChange={setContent} readOnly={false} />
      </Stack>
    </EditModal>
  );
}
