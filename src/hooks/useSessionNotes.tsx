import { useEffect, useState } from "react";
import type { Note } from "../types/Notes";
import { getNotes } from "../services/getNotes";

function useSessionNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  
  async function fetchNotes() {
    setLoading(true);
    setError(null);
  
    try {
    const { data, error: e } = await getNotes();

    if (e) throw e;
    setNotes(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);
  
  return { notes, setNotes, loading, setLoading, error, setError, fetchNotes };
}

export default useSessionNotes;