/*
TherapyNotesApp — single-file React + TypeScript example (App.tsx)
Tech: React, TypeScript, Material-UI (MUI v5), @supabase/supabase-js

What this file contains:
- Full React component (default export) that provides a form to add therapy session notes
  and a list view showing all notes from Supabase.
- Uses MUI components for UI.

Before running
1) Create a Supabase project and run the SQL below to create the `therapy_notes` table:

-- SQL to run in Supabase SQL editor
CREATE TABLE public.therapy_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name text NOT NULL,
  session_date date NOT NULL,
  quick_notes text,
  duration_minutes integer,
  created_at timestamptz DEFAULT now()
);

Note: If uuid_generate_v4() is not available, enable the extension:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- or use: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

2) Create a .env (or set env vars) with:
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

3) Install dependencies (example):
npm install @supabase/supabase-js @mui/material @mui/icons-material @emotion/react @emotion/styled
# If using Create React App with TypeScript, it should already have react/react-dom types

4) Replace your App.tsx with the contents of this file and run your project.

-----------
IMPLEMENTATION (App.tsx)
-----------
*/

import React, { useEffect, useState, type JSX } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useSessionNotes from "./hooks/useSessionNotes";
import { truncateNotes } from "./utils/truncateNotes";
import supabase from "../supabaseClient";
import type { Note } from "./types/Notes";

export default function App(): JSX.Element {
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      const { error: e } = await supabase.from("session_notes").delete().eq("id", id);
      if (e) throw e;
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
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

          <List>
            {notes.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No notes yet" />
              </ListItem>
            )}

            {notes.map(note => (
              <React.Fragment key={note.id}>
                <ListItem alignItems="flex-start" secondaryAction={
                  <Tooltip title="Delete note">
                    <IconButton edge="end" onClick={() => handleDelete(note.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }>
                  <ListItemText
                    primary={`${note.client_name} — ${note.session_date} (${note.duration ?? "—"} min)`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {truncateNotes(note.notes) ?? ""}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {note.created_at ? new Date(note.created_at).toLocaleString() : ""}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

