// app/admin/components/FormEditModal.tsx
"use client";

import { useState } from "react";
import { TextField, Stack } from "@mui/material";
import EditModal from "./EditModal";

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "number";
}

interface FormEditModalProps<T extends Record<string, any>> {
  open: boolean;
  title: string;
  fields: FormFieldConfig[];
  initialValues: T;
  onClose: () => void;
  onSave: (values: T) => Promise<void> | void;
}

export default function FormEditModal<T extends Record<string, any>>({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
}: FormEditModalProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  return (
    <EditModal open={open} title={title} onClose={onClose} onSave={handleSave} saving={saving} maxWidth="xs">
      <Stack spacing={2} sx={{ mt: 1 }}>
        {fields.map((f) => (
          <TextField
            key={f.name}
            label={f.label}
            type={f.type ?? "text"}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            fullWidth
          />
        ))}
      </Stack>
    </EditModal>
  );
}
