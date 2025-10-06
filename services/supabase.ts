import { createClient } from '@supabase/supabase-js';

// مقادیر زیر باید از طریق متغیرهای محیطی (environment variables) تنظیم شوند.
// این کار امنیت کلیدهای شما را تضمین می‌کند.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
