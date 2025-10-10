import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

// The API key is expected to be set as an environment variable.
// App.tsx will render an error component if it's missing.
const API_KEY = process.env.API_KEY!;
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * A robust JSON parser to handle potential markdown code blocks from the model.
 * @param rawText The raw text response from the AI model.
 * @returns The parsed JSON object.
 * @throws Throws an error if the JSON is invalid.
 */
function parseJsonResponse(rawText: string): any {
    let cleanText = rawText.trim();
    
    // Check for a markdown code block and extract JSON if it exists
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        cleanText = match[1];
    }

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", cleanText);
        // Provide a user-friendly error message in Persian
        throw new Error("پاسخ دریافت شده از هوش مصنوعی در قالب معتبر (JSON) نبود. لطفاً دوباره تلاش کنید.");
    }
}


/**
 * A centralized error handler for all Gemini API calls.
 * @param promiseFn A function that returns the API call promise to wrap.
 * @returns The result of the promise.
 * @throws Throws a user-friendly error.
 */
// Fix: Changed the function signature to accept a function that returns a promise, instead of a promise directly. This resolves the type error in all the service calls below.
async function handleApiError<T>(promiseFn: () => Promise<T>): Promise<T> {
    try {
        return await promiseFn();
    } catch (err) {
        console.error(`Gemini API call failed:`, err);
        if (err instanceof Error) {
            // Check for common network errors that might suggest a VPN is needed
            if (err.message.toLowerCase().includes('fetch')) {
                 throw new Error("خطا در اتصال به سرویس هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.");
            }
             // Handle safety blocks specifically
            if (err.message.includes('SAFETY')) {
                throw new Error("پاسخ به دلیل محدودیت‌های ایمنی مسدود شد. لطفاً تصویر یا متن دیگری را امتحان کنید.");
            }
            // Re-throw other errors from the SDK or parsing
            throw err;
        }
        // Fallback for non-Error objects
        throw new Error('یک خطای ناشناخته در ارتباط با سرویس هوش مصنوعی رخ داد.');
    }
}


export const analyzeImage = (base64Image: string): Promise<AnalysisResult> => {
    return handleApiError(async () => {
        const prompt = `
        شما یک هوش مصنوعی متخصص زیبایی‌شناسی هستید. وظیفه شما ارائه یک تحلیل چهره مثبت، محترمانه و سازنده است.
        تصویر چهره ارسالی توسط کاربر را بر اساس اصول هماهنگی، تقارن و وضوح چهره تحلیل کنید.
        این دستورالعمل‌ها را به دقت دنبال کنید:
        ۱. ابتدا بررسی کنید که آیا تصویر حاوی یک چهره انسانی واضح و تکی است. چهره باید سوژه اصلی باشد. اگر اینطور نیست، isValidFace را false قرار دهید و دلیلی در errorMessage ارائه دهید.
        ۲. اگر چهره معتبری شناسایی شد، isValidFace را true قرار دهید.
        ۳. یک 'harmonyScore' (امتیاز هماهنگی) از ۱ تا ۱۰ ارائه دهید. این امتیاز باید بازتابی از تعادل و تقارن چهره باشد، نه یک قضاوت ذهنی درباره "زیبایی".
        ۴. یک آرایه 'featureAnalysis' (تحلیل اجزا) ارائه دهید. برای هر جزء کلیدی (مانند چشم‌ها، بینی، لب‌ها، خط فک، پوست)، یک تحلیل کوتاه، مثبت و سازنده ارائه دهید. نام اجزا و تحلیل باید به زبان فارسی باشد.
        ۵. یک آرایه 'suggestions' (پیشنهادات) ارائه دهید. نکات کلی و مفیدی برای بهبود ویژگی‌های طبیعی ارائه دهید. بر روش‌های غیرتهاجمی مانند مراقبت از پوست، آراستگی و تکنیک‌های آرایشی تمرکز کنید. پیشنهادات را به عنوان بهبودهای مثبت مطرح کنید، نه اصلاح نواقص.
        ۶. خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "harmonyScore": number | null, "featureAnalysis": [{ "feature": string, "analysis": string }], "suggestions": [string] }. تمام متن‌های داخل JSON باید به زبان فارسی باشد.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }],
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
            }
        });
        
        return parseJsonResponse(response.text);
    });
};

export const getMorphSuggestions = (sourceImageBase64: string, targetImageBase64: string): Promise<MorphResult> => {
     return handleApiError(async () => {
        const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
        ۵. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
    `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: sourceImageBase64 } },
                    { inlineData: { mimeType: 'image/jpeg', data: targetImageBase64 } }
                ]
            }],
            config: {
                temperature: 0.4,
                responseMimeType: "application/json",
            }
        });
         return parseJsonResponse(response.text);
    });
};

export const getColorHarmonySuggestions = (base64Image: string): Promise<ColorHarmonyResult> => {
    return handleApiError(async () => {
        const prompt = `
        شما یک هوش مصنوعی متخصص در تئوری رنگ و استایلیست شخصی هستید. وظیفه شما تحلیل دقیق چهره در تصویر ارسالی و ارائه پیشنهادهای هماهنگی رنگ است.
        دستورالعمل‌ها:
        ۱. **اعتبارسنجی چهره:** ابتدا بررسی کنید که تصویر حاوی یک چهره انسانی واضح است. اگر نه، isValidFace را false و errorMessage را با یک دلیل مناسب پر کنید.
        ۲. **تحلیل ویژگی‌ها:** تناژ پوست (گرم، سرد، یا خنثی)، رنگ مو، و رنگ چشم‌ها را از تصویر تشخیص دهید.
        ۳. **خلاصه تحلیل:** در فیلد 'summary'، یک خلاصه کوتاه و مفید از ویژگی‌های تحلیل شده به زبان فارسی ارائه دهید.
        ۴. **ارائه پالت‌های رنگی:** سه پالت رنگی متمایز و هماهنگ با ویژگی‌های چهره پیشنهاد دهید.
        ۵. **جزئیات هر پالت:** برای هر پالت، یک 'name' خلاقانه، یک 'description' (توضیح هماهنگی)، و یک آرایه 'colors' شامل دقیقاً ۵ کد رنگ هگزادسیمال (مانند "#RRGGBB") ارائه دهید.
        ۶. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "summary": string, "palettes": [{ "name": string, "description": string, "colors": [string] }] }. تمام متون باید به زبان فارسی باشند.
    `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }],
            config: {
                temperature: 0.5,
                responseMimeType: "application/json",
            }
        });
        return parseJsonResponse(response.text);
    });
};

export const findNearbySalons = (locationQuery: string): Promise<Salon[]> => {
    return handleApiError(async () => {
        const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        خروجی شما باید یک آرایه JSON با ساختار هر شیء دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
    `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
            }
        });
        
        const result = parseJsonResponse(response.text);

        // Re-sort to ensure correct order, even if the model doesn't respect it
        if (Array.isArray(result)) {
            result.sort((a: {rating?: number}, b: {rating?: number}) => (b.rating ?? 0) - (a.rating ?? 0));
        }
        return result;
    });
};