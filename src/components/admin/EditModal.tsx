"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode } from "react";

interface EditModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
  fullScreen?: boolean; // needed for the scorecard editor — it's two grids, wants max space
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  hideFooter?: boolean; // scorecard editor autosaves per-inning already, so it doesn't need Save/Cancel
}

export default function EditModal({
  open,
  title,
  onClose,
  onSave,
  saving = false,
  fullScreen = false,
  maxWidth = "sm",
  children,
  hideFooter = false,
}: EditModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={fullScreen ? false : maxWidth}
      fullWidth={!fullScreen}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={fullScreen ? { p: 0 } : undefined}>
        {children}
      </DialogContent>

      {!hideFooter && (
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
