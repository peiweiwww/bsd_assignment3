import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Favorite = {
  id: string;
  user_id: string;
  meal_id: string;
  meal_name: string;
  meal_thumbnail: string | null;
  category: string | null;
  area: string | null;
  saved_at: string;
};
