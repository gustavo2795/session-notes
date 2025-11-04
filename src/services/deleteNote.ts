import supabase from "../../supabaseClient";

type Props = {
  id: string;
}
export const deleteNote = async ({id}: Props) => {
  const { error: e } = await supabase.from("session_notes").delete().eq("id", id);

  return {
    error: e,
  };
}