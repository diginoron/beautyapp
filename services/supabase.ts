import { createClient } from '@supabase/supabase-js';

// ====================================================================================
// ====================================================================================
// !! خطای "Failed to fetch" به دلیل تنظیم نبودن این فایل است !!
//
// اگر در هنگام ورود یا ثبت‌نام با خطای "Failed to fetch" یا "خطا در اتصال به شبکه"
// مواجه می‌شوید، دلیل آن این است که مقادیر زیر با اطلاعات واقعی پروژه Supabase
// شما جایگزین نشده‌اند.
//
// لطفاً برای حل مشکل، این مراحل را دنبال کنید:
// ۱. وارد داشبور Supabase خود شوید (app.supabase.com).
// ۲. به تنظیمات پروژه (آیکن چرخ‌دنده) و سپس بخش "API" بروید.
// ۳. مقدار "Project URL" را کپی کرده و جایگزین `supabaseUrl` کنید.
// ۴. کلید `anon` `public` را از بخش "Project API Keys" کپی کرده و جایگزین `supabaseAnonKey` کنید.
//
// تا زمانی که این مقادیر نمونه را تغییر ندهید، برنامه به پایگاه داده متصل نخواهد شد.
// ====================================================================================
// ====================================================================================

export const supabaseUrl = "https://rgstkjzexetemzcixrxr.supabase.co"; // <-- آدرس واقعی پروژه Supabase خود را اینجا قرار دهید
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc3RranpleGV0ZW16Y2l4cnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzgzNjksImV4cCI6MjA3NTM1NDM2OX0.Lod8RSMKz68WHsSGXaqkaCOdbo9nNJ3Tbu5ggAbKxPk"; // <-- کلید عمومی (anon) واقعی خود را اینجا قرار دهید


export const supabase = createClient(supabaseUrl, supabaseAnonKey);