
import { createClient } from '@supabase/supabase-js';

// --- هشدار امنیتی ---
// این روش فقط برای تست در محیط AI Studio است و ناامن محسوب می‌شود.
// لطفاً قبل از انتشار برنامه یا قرار دادن آن در یک مخزن عمومی، این مقادیر را حذف کرده
// و از متغیرهای محیطی (Environment Variables) در پلتفرم هاستینگ خود (مانند Vercel) استفاده کنید.

// TODO: مقادیر زیر را با اطلاعات پروژه Supabase خود جایگزین کنید.
const supabaseUrl = "https://rgstkjzexetemzcixrxr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc3RranpleGV0ZW16Y2l4cnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzgzNjksImV4cCI6MjA3NTM1NDM2OX0.Lod8RSMKz68WHsSGXaqkaCOdbo9nNJ3Tbu5ggAbKxPk";


// کد اصلی که از متغیرهای محیطی استفاده می‌کرد، به صورت کامنت باقی مانده است
// تا در زمان انتقال به هاست اصلی به راحتی به آن بازگردید.
// const supabaseUrl = process.env.SUPABASE_URL!;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("آدرس_URL")) {
    // این خطا به شما یادآوری می‌کند که مقادیر را جایگزین کنید.
    throw new Error("Supabase URL and Anon Key are not set correctly in services/supabase.ts. Please replace the placeholder values.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
      