import { List, ListItem, ListItemText, Tooltip, IconButton, Typography, Divider } from "@mui/material";
import React from "react";
import { truncateNotes } from "../utils/truncateNotes";
import type { Note } from "../types/Notes";
import DeleteIcon from "@mui/icons-material/Delete";
import supabase from "../../supabaseClient";


type Props = {
  notes: Note[];
  loading: boolean;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const NotesList = ({ notes, loading, setNotes, setError }: Props) => {

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
  )
};