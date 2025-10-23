import { supabase } from './supabase';
import type { Profile } from '../types';

/*
====================================================================================
====================================================================================
           >>>   !!! راهنمای نهایی و کامل برای پایگاه داده !!!   <<<

    کاربر گرامی،
    
    با عرض پوزش بابت خطای اخیر. راهنمای قبلی ناقص بود.
    این اسکریپت جدید و کامل، تمام مشکلات ساختار پایگاه داده را برای همیشه حل می‌کند.

    ✅ **لطفاً فقط یک بار این راهنما را دنبال کنید:**

    1.  وارد حساب کاربری خود در **Supabase.com** شوید و پروژه خود را باز کنید.
    2.  در منوی چپ، به بخش **SQL Editor** بروید.
    3.  روی **"+ New query"** کلیک کنید.
    4.  **تمام کد زیر را به طور کامل کپی کرده**، در ویرایشگر قرار دهید و روی **"RUN"** کلیک کنید.
        (این اسکریپت هوشمند است و اجرای چندباره آن مشکلی ایجاد نمی‌کند.)

    --- BEGIN SQL SCRIPT ---

    -- بخش اول: افزودن تمام ستون‌های لازم به جدول `profiles`
    -- این دستور ستون‌های `usage_count`, `last_reset`, و `token_balance` را در صورت عدم وجود، ایجاد می‌کند.
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS usage_count INT8 DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS last_reset TIMESTAMPTZ DEFAULT now() NOT NULL,
    ADD COLUMN IF NOT EXISTS token_balance INT8 DEFAULT 10000 NOT NULL;


    -- بخش دوم: ایجاد یا به‌روزرسانی توابع (Functions) برای مدیریت امن داده‌ها
    -- این بخش توابع لازم برای مدیریت سهمیه و توکن را ایجاد یا جایگزین می‌کند.

    -- تابع افزایش سهمیه روزانه
    CREATE OR REPLACE FUNCTION increment(row_id uuid, x int)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      UPDATE public.profiles
      SET usage_count = usage_count + x
      WHERE id = row_id;
    END;
    $$;

    -- تابع کاهش موجودی توکن
    CREATE OR REPLACE FUNCTION decrement_token_balance(row_id uuid, amount int)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      UPDATE public.profiles
      SET token_balance = token_balance - amount
      WHERE id = row_id;
    END;
    $$;

    --- END SQL SCRIPT ---

====================================================================================
====================================================================================
*/


// The maximum number of analyses a user can perform per day has been increased.
export const USAGE_LIMIT = 15;

/**
 * Checks if the user's usage needs to be reset (if it's a new day).
 * @param lastReset The last reset date string from the database.
 * @returns True if a reset is needed, false otherwise.
 */
const isNewDay = (lastReset: string): boolean => {
    const lastResetDate = new Date(lastReset);
    const today = new Date();
    // Compare year, month, and day, ignoring time.
    return (
        lastResetDate.getFullYear() !== today.getFullYear() ||
        lastResetDate.getMonth() !== today.getMonth() ||
        lastResetDate.getDate() !== today.getDate()
    );
};

/**
 * Retrieves the user profile, creating it if it doesn't exist.
 * This is a defensive measure in case the database trigger for profile creation fails.
 * @param userId The user's ID.
 * @returns The user's profile.
 * @throws Throws an error if profile retrieval or creation fails.
 */
const getProfile = async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code === 'PGRST116') { // 'PGRST116' means no rows found for a single() query
        // Profile doesn't exist, so let's create it.
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
                id: userId, 
                usage_count: 0, 
                last_reset: new Date().toISOString(),
                token_balance: 10000 // Initial token balance
            })
            .select()
            .single();
        if (insertError) throw new Error(`Failed to create profile: ${insertError.message}`);
        if (!newProfile) throw new Error('Profile creation did not return a profile.');
        return newProfile;
    } else if (error) {
        throw new Error(`Failed to get profile: ${error.message}`);
    }
    if (!data) throw new Error('Profile data is null.');
    return data;
};

/**
 * Checks the user's current status including daily usage and token balance. Resets daily usage if needed.
 * @param userId The ID of the user.
 * @returns An object containing the user's status.
 */
export const checkUserStatus = async (userId: string): Promise<{ 
    canProceed: boolean; 
    message: string; 
    currentUsage: number; 
    tokenBalance: number;
}> => {
    try {
        let profile = await getProfile(userId);
        
        // Reset usage if it's a new day
        if (isNewDay(profile.last_reset)) {
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ usage_count: 0, last_reset: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single();
            
            if (updateError) throw new Error(updateError.message);
            if (!updatedProfile) throw new Error('Profile update did not return a profile.');
            profile = updatedProfile;
        }

        const { usage_count: currentUsage, token_balance: tokenBalance } = profile;
        
        if (currentUsage >= USAGE_LIMIT) {
            return {
                canProceed: false,
                message: `شما به حد مجاز استفاده روزانه (${USAGE_LIMIT} تحلیل) رسیده‌اید. لطفاً فردا دوباره تلاش کنید.`,
                currentUsage,
                tokenBalance,
            };
        }

        if (tokenBalance <= 0) {
             return {
                canProceed: false,
                message: `موجودی توکن شما به اتمام رسیده است. لطفاً برای ادامه، حساب خود را ارتقا دهید.`,
                currentUsage,
                tokenBalance,
            };
        }

        return { canProceed: true, message: '', currentUsage, tokenBalance };

    } catch (error) {
        console.error("Error checking user status:", error);
        if (error instanceof Error) {
             // Check for the specific database schema error and provide a helpful message.
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                return {
                    canProceed: false,
                    message: "خطای تنظیم پایگاه داده: یک ستون ضروری یافت نشد. لطفاً به فایل services/profileService.ts مراجعه کرده و دستورالعمل SQL موجود در بالای فایل را برای رفع دائمی این مشکل اجرا کنید.",
                    currentUsage: 0,
                    tokenBalance: 0,
                };
            }
            return {
                canProceed: false,
                message: `خطا در بررسی سهمیه استفاده: ${error.message}`,
                currentUsage: 0,
                tokenBalance: 0,
            };
        }
         return {
            canProceed: false,
            message: 'خطای ناشناخته در بررسی سهمیه استفاده.',
            currentUsage: 0,
            tokenBalance: 0,
        };
    }
};

/**
 * Increments the user's analysis usage count by one.
 * This uses a database RPC call for an atomic update to prevent race conditions.
 * @param userId The ID of the user.
 */
export const incrementUsageCount = async (userId: string): Promise<void> => {
    try {
        const { error } = await supabase.rpc('increment', { row_id: userId, x: 1 });
        if (error) {
            throw new Error(`RPC call to 'increment' failed: ${error.message}`);
        }
    } catch (error) {
        console.error("Error incrementing usage count:", error);
    }
};

/**
 * Deducts a specified amount of tokens from the user's balance.
 * Uses a database RPC call for an atomic update.
 * @param userId The ID of the user.
 * @param amount The number of tokens to deduct.
 */
export const deductTokens = async (userId: string, amount: number): Promise<void> => {
    if (amount <= 0) return;
    try {
        const { error } = await supabase.rpc('decrement_token_balance', { row_id: userId, amount: amount });
        if (error) {
            throw new Error(`RPC call to 'decrement_token_balance' failed: ${error.message}`);
        }
    } catch (error) {
        console.error("Error deducting tokens:", error);
    }
};