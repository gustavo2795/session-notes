export type Note = {
  id: string;
  client_name: string;
  session_date: string; // ISO date
  notes: string | null;
  duration: number | null;
  created_at?: string;
}