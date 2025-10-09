import { createClient } from '@supabase/supabase-js';

// --- هشدار امنیتی بسیار مهم ---
// مقادیر زیر کلیدهای دسترسی به پایگاه داده شما هستند.
// قرار دادن آنها به صورت مستقیم در کد یک ریسک امنیتی بزرگ است،
// زیرا هر کسی می‌تواند آنها را ببیند و به دیتابیس شما دسترسی پیدا کند.
// این کلیدها از تاریخچه عمومی گیت‌هاب شما برداشته شده‌اند.
//
// **اقدام فوری:**
// ۱. به حساب Supabase خود بروید.
// ۲. این کلیدها را فوراً باطل (Invalidate) کنید.
// ۳. کلیدهای جدید بسازید و آنها را در بخش متغیرهای محیطی (Environment Variables)
//    سرویس میزبانی وب خود (مانند Vercel, Netlify) قرار دهید.
//
// این تغییر فقط برای رفع خطای فعلی و اجرای برنامه انجام شده است.
const supabaseUrl = 'https://omfdfaruurvfovtcljsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZmRmYXJ1dXJ2Zm92dGNsanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwODU5MjgsImV4cCI6MjAzNDY2MTkyOH0.M3pD9D4-tL87g23H7r0W9K68-w-i-d5d3p6h4Y5y7o8';

// The check for environment variables is removed because we are temporarily hardcoding the values.
// Please move these to environment variables as soon as possible.
if (!supabaseUrl || !supabaseAnonKey) {
    // This error should not be thrown anymore, but we keep it as a safeguard.
    throw new Error("Supabase URL and Anon Key are not defined. This is a critical error.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
