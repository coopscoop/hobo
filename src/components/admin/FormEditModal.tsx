// src/components/admin/FormEditModal.tsx
"use client";

import { useState } from "react";
import { TextField, MenuItem, Stack } from "@mui/material";
import EditModal from "@/components/admin/EditModal";

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "time";
  options?: { value: string | number; label: string }[]; // required when type is "select"
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

  const setField = (name: string, value: any) => setValues((v) => ({ ...v, [name]: value }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  return (
    <EditModal open={open} title={title} onClose={onClose} onSave={handleSave} saving={saving} maxWidth="xs">
      <Stack spacing={2} sx={{ mt: 1 }}>
        {fields.map((f) => {
          if (f.type === "select") {
            return (
              <TextField
                key={f.name}
                select
                label={f.label}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                fullWidth
              >
                {(f.options ?? []).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          return (
            <TextField
              key={f.name}
              label={f.label}
              type={f.type === "date" || f.type === "time" ? f.type : (f.type ?? "text")}
              value={values[f.name] ?? ""}
              onChange={(e) => setField(f.name, e.target.value)}
              fullWidth
            />
          );
        })}
      </Stack>
    </EditModal>
  );
}
