import supabase from "../../supabaseClient";
import type { Note } from "../types/Notes";

type Props = {
  payload: Partial<Note>;
}
export const createNote = async ({payload}: Props) => {
  const { data, error: e } = await supabase.from("session_notes").insert([payload]).select().single();

  return {
    data: data ?? [],
    error: e,
  };
}