import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./src/types/database.types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase: SupabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);


export default supabase;