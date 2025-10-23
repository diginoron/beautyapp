import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

/**
 * An instance of the GoogleGenAI client is created.
 * Throws an error if the API key is not available in the environment,
 * preventing the app from running in a misconfigured state.
 */
const getAiInstance = () => {
    if (!process.env.API_KEY) {
        // This error will be caught by the UI and shown to the user.
        throw new Error("کلید API هوش مصنوعی (GEMINI_API_KEY) در محیط برنامه یافت نشد. لطفاً از تنظیم صحیح آن اطمینان حاصل کنید.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * A centralized function to handle calls to the Gemini API and parse the JSON response.
 * @param model The Gemini model to use.
 * @param contents The contents to send to the model.
 * @param generationConfig The generation configuration.
 * @returns A promise that resolves with the parsed JSON object and the total tokens used.
 * @throws Throws a user-friendly error on failure.
 */
async function callGeminiAndParseJson<T>(model: string, contents: any, generationConfig: any): Promise<{ data: T; totalTokens: number }> {
    try {
        const ai = getAiInstance();
        
        const response = await ai.models.generateContent({
            model,
            contents,
            config: generationConfig,
        });
        
        const totalTokens = response.usageMetadata?.totalTokenCount ?? 0;
        const jsonText = response.text.trim();

        if (!jsonText) {
            throw new Error("پاسخ خالی از هوش مصنوعی دریافت شد.");
        }
        
        const data = JSON.parse(jsonText) as T;
        return { data, totalTokens };
        
    } catch (err) {
        console.error("Gemini API Error:", err);
        if (err instanceof Error) {
            // Re-throw known configuration errors
            if (err.message.includes("API key")) {
                throw err;
            }
            if (err.message.toLowerCase().includes('safety')) {
               throw new Error("پاسخ به دلیل محدودیت‌های ایمنی مسدود شد. لطفاً تصویر یا متن دیگری را امتحان کنید.");
            }
             if (err.message.toLowerCase().includes('fetch')) {
                 throw new Error("خطا در اتصال به سرور هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.");
            }
        }
        throw new Error('خطایی ناشناخته در هنگام ارتباط با هوش مصنوعی رخ داد. لطفاً دوباره تلاش کنید.');
    }
}

export const analyzeImage = async (base64Image: string): Promise<{ data: AnalysisResult; totalTokens: number }> => {
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

    const contents = {
        parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
    };
    
    const generationConfig = {
        temperature: 0.3,
        responseMimeType: "application/json",
    };

    return await callGeminiAndParseJson<AnalysisResult>('gemini-2.5-flash', contents, generationConfig);
};

export const getMorphSuggestions = async (sourceImageBase64: string, targetImageBase64: string): Promise<{ data: MorphResult; totalTokens: number }> => {
    const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
        ۵. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
    `;

    const contents = {
        parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: sourceImageBase64 } },
            { inlineData: { mimeType: 'image/jpeg', data: targetImageBase64 } }
        ]
    };
    
    const generationConfig = {
        temperature: 0.4,
        responseMimeType: "application/json",
    };

    return await callGeminiAndParseJson<MorphResult>('gemini-2.5-flash', contents, generationConfig);
};

export const getColorHarmonySuggestions = async (base64Image: string): Promise<{ data: ColorHarmonyResult; totalTokens: number }> => {
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

     const contents = {
        parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
    };
    
    const generationConfig = {
        temperature: 0.5,
        responseMimeType: "application/json",
    };
    
    return await callGeminiAndParseJson<ColorHarmonyResult>('gemini-2.5-flash', contents, generationConfig);
};

export const findNearbySalons = async (locationQuery: string): Promise<{ data: Salon[]; totalTokens: number }> => {
    const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        خروجی شما باید یک آرایه JSON با ساختار هر شیء دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
    `;

    const contents = { parts: [{ text: prompt }] };
    
    const generationConfig = {
        temperature: 0.2,
        responseMimeType: "application/json",
    };

    const { data: result, totalTokens } = await callGeminiAndParseJson<Salon[]>('gemini-2.5-flash', contents, generationConfig);

    // Sort again on the client-side to ensure correct order
    if (Array.isArray(result)) {
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return { data: result, totalTokens };
};
