import { createClient } from '@supabase/supabase-js';

// ====================================================================================
// ====================================================================================
// !! توجه: این فایل به حالت اتصال مستقیم به Supabase بازگردانده شد !!
//
// این روش ممکن است برای کاربرانی که در ایران هستند به دلیل محدودیت‌های شبکه
// کار نکند و نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) داشته باشد.
//
// مقادیر زیر به صورت مستقیم برای اتصال استفاده می‌شوند.
// ====================================================================================
// ====================================================================================

const supabaseUrl = "https://rgstkjzexetemzcixrxr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc3RranpleGV0ZW16Y2l4cnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzgzNjksImV4cCI6MjA3NTM1NDM2OX0.Lod8RSMKz68WHsSGXaqkaCOdbo9nNJ3Tbu5ggAbKxPk"; 

// A basic client is created with the public URL and anon key.
// This client can be used for all interactions with Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
