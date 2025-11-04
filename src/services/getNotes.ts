import supabase from "../../supabaseClient";
import type { Note } from "../types/Notes";

export const getNotes = async () => {
  const { data, error: e } = await supabase
    .from("session_notes")
    .select("*")
    .order("session_date", { ascending: false })
    .limit(200)
    .overrideTypes<Array<Note>, { merge: false}>();

  return {
    data: data ?? [],
    error: e,
  };
}