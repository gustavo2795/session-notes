export const truncateNotes = (text: string | null) => {
  if (!text) return "";
  return text.length > 100 ? text.slice(0, 100) + "…" : text;
  };