import React, { useState, type JSX } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import useSessionNotes from "../hooks/useSessionNotes";
import supabase from "../../supabaseClient";
import type { Note } from "../types/Notes";
import { NotesList } from "../components/NotesList";

export default function SessionNote(): JSX.Element {
  const [clientName, setClientName] = useState("");
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [quickNotes, setQuickNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">(15);
  const [saving, setSaving] = useState(false);
  const { notes, loading, error, setNotes, setError } = useSessionNotes();
  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    if (!sessionDate) {
      setError("Session date is required.");
      return;
    }
    if (quickNotes.length > 500) {
      setError("Quick notes must be 500 characters or less.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        client_name: clientName.trim(),
        session_date: sessionDate,
        notes: quickNotes.trim() || null,
        duration: durationMinutes === "" ? null : Number(durationMinutes),
      };

      const { data, error: e } = await supabase.from("session_notes").insert([payload]).select().single();
      if (e) throw e;

      // If realtime isn't available, prepend the new note locally
      if (data) setNotes(prev => [data as Note, ...prev]);

      // Reset form
      setClientName("");
      setSessionDate(new Date().toISOString().slice(0, 10));
      setQuickNotes("");
      setDurationMinutes(60);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper style={{ width: "1028px"}} sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Therapy Session Notes
        </Typography>

        <Box component="form" onSubmit={handleSave} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Client name"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Session date"
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Quick notes"
              value={quickNotes}
              onChange={e => setQuickNotes(e.target.value)}
              multiline
              minRows={3}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              helperText={`${quickNotes.length}/500`}
              fullWidth
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving..." : "Save note"}
              </Button>
            </Stack>

            {error && (
              <Typography color="error">{error}</Typography>
            )}
          </Stack>
        </Box>
      </Paper>

      <Box mt={3}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">All notes</Typography>
            <Typography variant="body2" color="text.secondary">{loading ? "Loading..." : `${notes.length} notes`}</Typography>
          </Stack>

          <NotesList notes={notes} loading={loading} setNotes={setNotes} setError={setError} />
        </Paper>
      </Box>
    </Container>
  );
}

