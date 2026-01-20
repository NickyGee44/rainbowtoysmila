import { createClient } from "@supabase/supabase-js";

// Public client (for reading public data)
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase URL and Anon Key are required");
  }

  return createClient(url, anonKey);
}

// Admin client (for writing data - uses service role key)
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase URL and Service Role Key are required");
  }

  return createClient(url, serviceKey);
}

// Types
export type Toy = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  source_url: string | null;
  tags: string[];
  difficulty: string;
  print_time_hours: number;
  license_status: string;
};

export type Color = {
  id: string;
  name: string;
  hex: string;
  in_stock: boolean;
};
