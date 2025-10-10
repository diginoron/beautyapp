// به Vercel دستور می‌دهد که این تابع را به عنوان یک Edge Function برای حداکثر سرعت اجرا کند
export const config = {
    runtime: 'edge',
};

/**
 * یک پارسر JSON قوی برای مدیریت کدهای مارک‌داون احتمالی از مدل.
 * @param rawText پاسخ متنی خام از مدل هوش مصنوعی.
 * @returns شیء JSON پارس شده.
 * @throws در صورت نامعتبر بودن JSON، خطا پرتاب می‌کند.
 */
function parseJsonResponse(rawText: string): any {
    let cleanText = rawText.trim();
    
    // بررسی وجود بلاک کد مارک‌داون و استخراج JSON در صورت وجود
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        cleanText = match[1];
    }

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", cleanText);
        // ارائه یک خطای کاربرپسند به زبان فارسی
        throw new Error("پاسخ دریافت شده از هوش مصنوعی در قالب معتبر (JSON) نبود. لطفاً دوباره تلاش کنید.");
    }
}

// --- مدیریت متمرکز کلید API ---

function getApiKey(): string {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.startsWith('AIza')) {
        console.error("CRITICAL: Gemini API key is missing or invalid on the server.");
        throw new Error("خطای پیکربندی سرور: متغیر GEMINI_API_KEY در متغیرهای محیطی تنظیم نشده است.");
    }
    return apiKey;
}

// --- تابع عمومی برای فراخوانی Gemini REST API ---

async function callGemini(model: string, body: object): Promise<any> {
    const apiKey = getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
        console.error("Gemini API Error:", responseData);
        throw new Error(responseData.error?.message || 'خطا در ارتباط با سرور هوش مصنوعی.');
    }

    const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText === undefined || rawText === null) {
        console.error("Invalid Gemini Response Structure:", responseData);
        // بررسی مسدود شدن به دلیل ایمنی
        if (responseData.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error("پاسخ به دلیل محدودیت‌های ایمنی مسدود شد. لطفاً تصویر یا متن دیگری را امتحان کنید.");
        }
        throw new Error("پاسخ نامعتبر از هوش مصنوعی دریافت شد.");
    }

    // چون responseMimeType: "application/json" است، مدل باید مستقیماً JSON برگرداند
    return JSON.parse(rawText);
}


// --- هندلر اصلی مسیر API ---

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { action, params } = await request.json();
        let result;

        switch (action) {
            case 'analyzeImage':
                result = await analyzeImageHandler(params);
                break;
            case 'getMorphSuggestions':
                result = await getMorphSuggestionsHandler(params);
                break;
            case 'getColorHarmonySuggestions':
                result = await getColorHarmonySuggestionsHandler(params);
                break;
            case 'findNearbySalons':
                result = await findNearbySalonsHandler(params);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(`[Edge API Error] Action failed:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


// --- هندلرهای هر اکشن (بازنویسی شده برای REST API) ---

async function analyzeImageHandler(params: { base64Image: string }) {
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
        ۶. خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "harmonyScore": number | null, "featureAnalysis": [{ "feature": string, "analysis": string }], "suggestions": [string] }. تمام متن‌های داخل JSON باید به زبان فارسی باشد.
    `;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
            ]
        }],
        generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
        }
    };

    return callGemini('gemini-2.5-flash', requestBody);
}

async function getMorphSuggestionsHandler(params: { sourceImageBase64: string, targetImageBase64: string }) {
    const { sourceImageBase64, targetImageBase64 } = params;
    if (!sourceImageBase64 || !targetImageBase64) throw new Error("Missing source or target image parameter.");

    const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
        ۵. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
    `;
    
    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: sourceImageBase64 } },
                { inlineData: { mimeType: 'image/jpeg', data: targetImageBase64 } }
            ]
        }],
        generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
        }
    };

    return callGemini('gemini-2.5-flash', requestBody);
}

async function getColorHarmonySuggestionsHandler(params: { base64Image: string }) {
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
        ۶. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "summary": string, "palettes": [{ "name": string, "description": string, "colors": [string] }] }. تمام متون باید به زبان فارسی باشند.
    `;
    
    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
            ]
        }],
        generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
        }
    };
    
    return callGemini('gemini-2.5-flash', requestBody);
}

async function findNearbySalonsHandler(params: { locationQuery: string }) {
    const { locationQuery } = params;
    if (!locationQuery) throw new Error("Missing 'locationQuery' parameter.");

    const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        خروجی شما باید یک آرایه JSON با ساختار هر شیء دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
    `;

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        }
    };
    
    const result = await callGemini('gemini-2.5-flash', requestBody);
    
    // مرتب‌سازی مجدد برای اطمینان از ترتیب صحیح، حتی اگر مدل رعایت نکرده باشد
    if (Array.isArray(result)) {
        result.sort((a: {rating?: number}, b: {rating?: number}) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return result;
}