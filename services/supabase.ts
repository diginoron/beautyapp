import { createClient } from '@supabase/supabase-js';

// =================================================================
// !! اقدام فوری: لطفاً اطلاعات Supabase خود را وارد کنید !!
//
// این برنامه برای ذخیره اطلاعات کاربران و سابقه تحلیل‌ها از Supabase استفاده می‌کند.
// برای اینکه برنامه به درستی کار کند، باید اطلاعات اتصال پروژه Supabase خود را در اینجا وارد کنید.
//
// مراحل:
// ۱. به داشبورد Supabase خود در app.supabase.com بروید.
// ۲. اگر پروژه‌ای ندارید، یک پروژه جدید بسازید.
// ۳. به بخش تنظیمات پروژه (Project Settings) > API بروید.
// ۴. مقدار "Project URL" را کپی کرده و در متغیر `supabaseUrl` زیر قرار دهید.
// ۵. مقدار کلید `anon` `public` را از بخش "Project API Keys" کپی کرده و در متغیر `supabaseAnonKey` زیر قرار دهید.
// =================================================================

const supabaseUrl = "https://rgstkjzexetemzcixrxr.supabase.co"; // <-- آدرس پروژه Supabase خود را اینجا قرار دهید
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc3RranpleGV0ZW16Y2l4cnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzgzNjksImV4cCI6MjA3NTM1NDM2OX0.Lod8RSMKz68WHsSGXaqkaCOdbo9nNJ3Tbu5ggAbKxPk"; // <-- کلید عمومی (anon) خود را اینجا قرار دهید


if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    const warningMessage = `
    ===============================================================
     هشدار: اطلاعات اتصال به Supabase تنظیم نشده است. 
    ===============================================================
    برای فعال‌سازی قابلیت‌های ورود، ثبت‌نام و ذخیره سابقه،
    لطفاً فایل 'services/supabase.ts' را باز کرده و مقادیر
    'supabaseUrl' و 'supabaseAnonKey' را با اطلاعات پروژه
    Supabase خود جایگزین کنید.
    ===============================================================
    `;
    console.warn(warningMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
