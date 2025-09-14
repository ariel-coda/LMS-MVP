import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase URL et/ou clé manquants. Vérifie ton .env ou Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);


// Types TypeScript
export interface Filieres {
  id: string
  nom: string
  description?: string
  created_at: string
  user_id: string
}