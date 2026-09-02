"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { login } from "@/lib/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin");
      router.refresh(); // clears any cached server-rendered state from the pre-login request
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 360, mx: "auto", mt: 10, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5">Log In</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </Box>
  );
}
