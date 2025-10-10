import { GoogleGenAI } from '@google/genai';

/**
 * A robust JSON parser to handle potential markdown code fences from the model.
 * @param rawText The raw string response from the AI model.
 * @returns The parsed JSON object.
 * @throws An error if the JSON is malformed.
 */
function parseJsonResponse(rawText: string): any {
    let cleanText = rawText.trim();
    
    // Check for markdown code block and extract JSON if present
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        cleanText = match[1];
    }

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", cleanText);
        // Provide a user-friendly error in Persian
        throw new Error("پاسخ دریافت شده از هوش مصنوعی در قالب معتبر (JSON) نبود. لطفاً دوباره تلاش کنید.");
    }
}


// --- Centralized AI Client Initialization ---

function getAiClient() {
    const apiKey = process.env.API_KEY;
    if (!apiKey || !apiKey.startsWith('AIza')) {
        console.error("CRITICAL: Gemini API key is missing or invalid on the server.");
        throw new Error("Server configuration error: Gemini API key is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

// --- Main API Route Handler ---

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { action, params } = await request.json();
        const ai = getAiClient();
        let result;

        switch (action) {
            case 'analyzeImage':
                result = await analyzeImageHandler(ai, params);
                break;
            case 'getMorphSuggestions':
                result = await getMorphSuggestionsHandler(ai, params);
                break;
            case 'getColorHarmonySuggestions':
                result = await getColorHarmonySuggestionsHandler(ai, params);
                break;
            case 'findNearbySalons':
                result = await findNearbySalonsHandler(ai, params);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(`[API Error] Action failed:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


// --- Individual Action Handlers ---

async function analyzeImageHandler(ai: GoogleGenAI, params: { base64Image: string }) {
    const { base64Image } = params;
    if (!base64Image) throw new Error("Missing 'base64Image' parameter.");
    
    const prompt = `
        شما یک هوش مصنوعی متخصص زیبایی‌شناسی هستید. وظیفه شما ارائه یک تحلیل چهره مثبت، محترمانه و سازنده است.
        تصویر چهره ارسالی توسط کاربر را بر اساس اصول هماهنگی، تقارن و وضوح چهره تحلیل کنید.
        این دستورالعمل‌ها را به دقت دنبال کنید:
        ۱. ابتدا بررسی کنید که آیا تصویر حاوی یک چهره انسانی واضح و تکی است. چهره باید سوژه اصلی باشد. اگر اینطور نیست، isValidFace را false قرار دهید و دلیلی در errorMessage ارائه دهید.
        ۲. اگر چهره معتبری شناسایی شد، isValidFace را true قرار دهید.
        ۳. یک 'harmonyScore' (امتیاز هماهنگی) از ۱ تا ۱۰ ارائه دهید. این امتیاز باید بازتابی از تعادل و تقارن چهره باشد، نه یک قضاوت ذهنی درباره "زیبایی".
        ۴. یک آرایه 'featureAnalysis' (تحلیل اجزا) ارائه دهید. برای هر جزء کلیدی (مانند چشم‌ها، بینی، لب‌ها، خط فک، پوست)، یک تحلیل کوتاه، مثبت و سازنده ارائه دهید. نام اجزا و تحلیل باید به زبان فارسی باشد.
        ۵. یک آرایه 'suggestions' (پیشنهادات) ارائه دهید. نکات کلی و مفیدی برای بهبود ویژگی‌های طبیعی ارائه دهید. بر روش‌های غیرتهاجمی مانند مراقبت از پوست، آراستگی و تکنیک‌های آرایشی تمرکز کنید. پیشنهادات را به عنوان بهبودهای مثبت مطرح کنید، نه اصلاح نواقص.
        ۶. خروجی شما باید **فقط و فقط** یک شیء JSON باشد. هیچ متن اضافی، توضیحات، یا قالب‌بندی مارک‌داون (مانند \`\`\`json) در ابتدا یا انتهای خروجی قرار ندهید. ساختار JSON باید دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "harmonyScore": number | null, "featureAnalysis": [{ "feature": string, "analysis": string }], "suggestions": [string] }. تمام متن‌های داخل JSON باید به زبان فارسی باشد.
    `;

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    return parseJsonResponse(response.text);
}

async function getMorphSuggestionsHandler(ai: GoogleGenAI, params: { sourceImageBase64: string, targetImageBase64: string }) {
    const { sourceImageBase64, targetImageBase64 } = params;
    if (!sourceImageBase64 || !targetImageBase64) throw new Error("Missing source or target image parameter.");

    const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
        ۵. **فرمت خروجی:** خروجی شما باید **فقط و فقط** یک شیء JSON باشد. هیچ متن اضافی یا قالب‌بندی مارک‌داون اضافه نکنید. ساختار JSON باید دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
    `;
    
    const sourceImagePart = { inlineData: { mimeType: 'image/jpeg', data: sourceImageBase64 } };
    const targetImagePart = { inlineData: { mimeType: 'image/jpeg', data: targetImageBase64 } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, sourceImagePart, targetImagePart] },
        config: {
            temperature: 0.4,
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    return parseJsonResponse(response.text);
}

async function getColorHarmonySuggestionsHandler(ai: GoogleGenAI, params: { base64Image: string }) {
    const { base64Image } = params;
    if (!base64Image) throw new Error("Missing 'base64Image' parameter.");

    const prompt = `
        شما یک هوش مصنوعی متخصص در تئوری رنگ و استایلیست شخصی هستید. وظیفه شما تحلیل دقیق چهره در تصویر ارسالی و ارائه پیشنهادهای هماهنگی رنگ است.
        دستورالعمل‌ها:
        ۱. **اعتبارسنجی چهره:** ابتدا بررسی کنید که تصویر حاوی یک چهره انسانی واضح است. اگر نه، isValidFace را false و errorMessage را با یک دلیل مناسب پر کنید.
        ۲. **تحلیل ویژگی‌ها:** تناژ پوست (گرم، سرد، یا خنثی)، رنگ مو، و رنگ چشم‌ها را از تصویر تشخیص دهید.
        ۳. **خلاصه تحلیل:** در فیلد 'summary'، یک خلاصه کوتاه و مفید از ویژگی‌های تحلیل شده به زبان فارسی ارائه دهید.
        ۴. **ارائه پالت‌های رنگی:** سه پالت رنگی متمایز و هماهنگ با ویژگی‌های چهره پیشنهاد دهید.
        ۵. **جزئیات هر پالت:** برای هر پالت، یک 'name' خلاقانه، یک 'description' (توضیح هماهنگی)، و یک آرایه 'colors' شامل دقیقاً ۵ کد رنگ هگزادسیمال (مانند "#RRGGBB") ارائه دهید.
        ۶. **فرمت خروجی:** خروجی شما باید **فقط و فقط** یک شیء JSON باشد. هیچ متن اضافی یا قالب‌بندی مارک‌داون اضافه نکنید. ساختار JSON باید دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "summary": string, "palettes": [{ "name": string, "description": string, "colors": [string] }] }. تمام متون باید به زبان فارسی باشند.
    `;

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    return parseJsonResponse(response.text);
}

async function findNearbySalonsHandler(ai: GoogleGenAI, params: { locationQuery: string }) {
    const { locationQuery } = params;
    if (!locationQuery) throw new Error("Missing 'locationQuery' parameter.");

    const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        خروجی شما باید **فقط و فقط** یک آرایه JSON باشد. هیچ متن اضافی یا قالب‌بندی دیگری اضافه نکنید.
        ساختار هر شیء در آرایه باید دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.2,
            thinkingConfig: { thinkingBudget: 0 },
        }
    });

    const result = parseJsonResponse(response.text);
    // Ensure sorting by rating as a fallback, in case the model doesn't do it perfectly.
    if (Array.isArray(result)) {
        result.sort((a: {rating?: number}, b: {rating?: number}) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return result;
}
