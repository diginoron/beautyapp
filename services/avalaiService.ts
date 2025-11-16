import { OpenAI } from "openai";
import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

// IMPORTANT SECURITY NOTE:
// در یک برنامه واقعی در محیط تولید (Production)، قرار دادن مستقیم کلید API در کد سمت مشتری (Client-side)
// یک خطر امنیتی قابل توجه است. این کلید می‌تواند به راحتی توسط کاربران استخراج شده و منجر به استفاده غیرمجاز شود.
// برای امنیت قوی، اکیداً توصیه می‌شود از یک پروکسی سمت سرور (مانند فانکشن serverless Vercel که قبلاً استفاده می‌شد)
// برای مدیریت کلیدهای API استفاده کنید.
// به دلیل درخواست کاربر برای افزایش سرعت و انتقال فراخوانی API به فرانت‌اند، کلید API مستقیماً در اینجا استفاده می‌شود.
// فرض بر این است که `process.env.API_KEY` توسط سیستم بیلد (مانند Vite) تزریق می‌شود یا به عنوان یک متغیر محیطی در دسترس است.

const client = new OpenAI({
    // FIX: Changed to use process.env.API_KEY as per coding guidelines for API key access.
    // لطفاً در محیط تولید، `process.env.API_KEY` را با یک مقدار واقعی جایگزین کنید یا از سیستم بیلد استفاده کنید.
    apiKey: process.env.API_KEY, // هشدار: این کلید در مرورگر قابل مشاهده خواهد بود!
    baseURL: "https://api.avalai.ir/v1", // نقطه پایانی API AvalAI
    dangerouslyAllowBrowser: true, // FIX: Required for running OpenAI client directly in browser environments.
});

const commonChatCompletionParams = {
    model: "gemini-2.5-flash", // طبق درخواست، از gemini-2.5-flash استفاده می‌شود
    temperature: 0.3, // دمای پیش‌فرض، در صورت نیاز می‌تواند برای هر وظیفه تنظیم شود
    response_format: { type: "json_object" } as const // درخواست خروجی JSON برای پاسخ‌های ساختاریافته
};

export async function analyzeImage(base64Image: string): Promise<{ data: AnalysisResult; totalTokens: number }> {
    const prompt = `
        شما یک هوش مصنوعی متخصص زیبایی‌شناسی هستید. وظیفه شما ارائه یک تحلیل چهره مثبت، محترمانه و سازنده است.
        تصویر چهره ارسالی توسط کاربر را بر اساس اصول هماهنگی، تقارن و وضوح چهره تحلیل کنید.
        برای این تحلیل، به طور خاص شاخص‌های زیبایی‌شناسی زیر را در نظر بگیرید:

        ۱.  **نسبت طلایی (Golden Ratio - φ ≈ ۱.۶۱۸):**
            *   طول صورت ÷ عرض صورت
            *   فاصله بین دو چشم ÷ عرض یک چشم
            *   عرض دهان ÷ عرض بینی
            *   بررسی کنید که چگونه این نسبت‌ها در چهره با ۱.۶۱۸ مطابقت دارند.

        ۲.  **تقارن صورت (Facial Symmetry):**
            *   میزان تقارن بین دو نیمه صورت (چپ و راست) را ارزیابی کنید.
            *   اشاره کنید که چگونه تقارن یا عدم تقارن به جذابیت چهره کمک می‌کند.

        ۳.  **قانون یک‌سوم افقی و یک‌پنجم عمودی (Rule of Thirds & Fifths):**
            *   **افقی (یک‌سوم):** پیشانی (از خط رویش مو تا ابروها)، وسط صورت (ابروها تا زیر بینی)، و چانه (زیر بینی تا نوک چانه). بررسی کنید که آیا این سه بخش تقریباً مساوی هستند.
            *   **عمودی (یک‌پنجم):** عرض صورت به پنج قسمت مساوی تقسیم می‌شود (عرض هر چشم، فاصله بین دو چشم، و عرض بینی هر کدام تقریباً ۱/۵ عرض کل صورت). بررسی کنید که چگونه این اندازه‌ها در چهره با این قانون مطابقت دارند.

        ۴.  **زاویه‌های صورت (Facial Angles):**
            *   **زاویه نازولبیال (Nasolabial Angle):** زاویه بین بینی و لب بالایی (ایدئال ۹۰–۱۱۰ درجه).
            *   **زاویه چانه–گردن (Cervicomental Angle):** زاویه بین چانه و گردن (ایدئال ۱۱۰–۱۲۰ درجه).
            *   **زاویه پیشانی–بینی (Fronto-Nasal Angle):** زاویه بین پیشانی و پل بینی (ایدئال ۱۱۵–۱۳۰ درجه).
            *   بررسی کنید که چگونه این زاویه‌ها در چهره مشاهده می‌شوند.

        این دستورالعمل‌ها را به دقت دنبال کنید:
        ۱. ابتدا بررسی کنید که آیا تصویر حاوی یک چهره انسانی واضح و تکی است. چهره باید سوژه اصلی باشد. اگر اینطور نیست، isValidFace را false قرار دهید و دلیلی در errorMessage ارائه دهید.
        ۲. اگر چهره معتبری شناسایی شد، isValidFace را true قرار دهید.
        ۳. یک 'harmonyScore' (امتیاز هماهنگی) از ۱ تا ۱۰ ارائه دهید. این امتیاز باید بازتابی جامع از مطابقت چهره با شاخص‌های فوق باشد (نسبت طلایی، تقارن، قوانین یک‌سوم/یک‌پنجم و زاویه‌های صورت)، نه یک قضاوت ذهنی درباره "زیبایی". توضیح دهید که امتیاز چگونه بر اساس این شاخص‌ها محاسبه شده است.
        ۴. یک آرایه 'featureAnalysis' (تحلیل اجزا) ارائه دهید. برای هر جزء کلیدی (مانند چشم‌ها، بینی، لب‌ها، خط فک، پیشانی، تقارن کلی)، یک تحلیل کوتاه، مثبت و سازنده ارائه دهید که به صراحت به یکی یا چند شاخص زیبایی‌شناسی فوق‌الذکر اشاره کند. نام اجزا و تحلیل باید به زبان فارسی باشد.
        ۵. یک آرایه 'suggestions' (پیشنهادات) ارائه دهید. نکات کلی و مفیدی برای بهبود ویژگی‌های طبیعی ارائه دهید که چهره را به شاخص‌های زیبایی‌شناسی فوق نزدیک‌تر کند. بر روش‌های غیرتهاجمی مانند مراقبت از پوست، آراستگی، مدل مو، فرم ابرو و تکنیک‌های آرایشی (مانند کانتورینگ برای بهبود زوایا یا برجسته‌سازی) تمرکز کنید. پیشنهادات را به عنوان بهبودهای مثبت مطرح کنید، نه اصلاح نواقص.
        ۶. خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "harmonyScore": number | null, "featureAnalysis": [{ "feature": string, "analysis": string }], "suggestions": [string] }. تمام متن‌های داخل JSON باید به زبان فارسی باشد.
    `;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] },
    ];

    try {
        const completion = await client.chat.completions.create({
            ...commonChatCompletionParams,
            messages,
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        const totalTokens = completion.usage?.total_tokens ?? 0;

        if (!rawText) {
            throw new Error("Empty response received from AvalAI.");
        }

        let data: AnalysisResult;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("JSON Parse Error (analyzeImage):", parseError);
            console.error("Raw Text (analyzeImage):", rawText);
            throw new Error("Failed to parse AI response as JSON for analyzeImage.");
        }
        return { data, totalTokens };
    } catch (err: any) {
        console.error("AvalAI Service Error (analyzeImage):", err);
        throw new Error(handleAvalAIError(err));
    }
}

export async function getMorphSuggestions(sourceImageBase64: string, targetImageBase64: string): Promise<{ data: MorphResult; totalTokens: number }> {
    const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
        ۵. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
    `;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${sourceImageBase64}` } },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${targetImageBase64}` } },
            ],
        },
    ];

    try {
        const completion = await client.chat.completions.create({
            ...commonChatCompletionParams,
            messages,
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        const totalTokens = completion.usage?.total_tokens ?? 0;

        if (!rawText) {
            throw new Error("Empty response received from AvalAI.");
        }

        let data: MorphResult;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("JSON Parse Error (getMorphSuggestions):", parseError);
            console.error("Raw Text (getMorphSuggestions):", rawText);
            throw new Error("Failed to parse AI response as JSON for getMorphSuggestions.");
        }
        return { data, totalTokens };
    } catch (err: any) {
        console.error("AvalAI Service Error (getMorphSuggestions):", err);
        throw new Error(handleAvalAIError(err));
    }
}

export async function getColorHarmonySuggestions(base64Image: string): Promise<{ data: ColorHarmonyResult; totalTokens: number }> {
    const prompt = `
        شما یک هوش مصنوعی متخصص در تئوری رنگ و استایلیست شخصی هستید. وظیفه شما تحلیل دقیق چهره در تصویر ارسالی و ارائه پیشنهادهای هماهنگی رنگ است.
        دستورالعمل‌ها:
        ۱. **اعتبارسنجی چهره:** ابتدا بررسی کنید که تصویر حاوی یک چهره انسانی واضح است. اگر نه، isValidFace را false و errorMessage را با یک دلیل مناسب پر کنید.
        ۲. **تحلیل ویژگی‌ها:** تناژ پوست (گرم، سرد، یا خنثی)، رنگ مو، و رنگ چشم‌ها را از تصویر تشخیص دهید.
        ۳. **خلاصه تحلیل:** در فیلد 'summary'، یک خلاصه کوتاه و مفید از ویژگی‌های تحلیل شده به زبان فارسی ارائه دهید.
        ۴. **ارائه پالت‌های رنگی:** سه پالت رنگی متمایز و هماهنگ با ویژگی‌های چهره پیشنهاد دهید.
        ۵. **جزئیات هر پالت:** برای هر پالت، یک 'name' خلاقانه, یک 'description' (توضیح هماهنگی)، و یک آرایه 'colors' شامل دقیقاً ۵ کد رنگ هگزادسیمال (مانند "#RRGGBB") ارائه دهید.
        ۶. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "summary": string, "palettes": [{ "name": string, "description": string, "colors": [string] }] }. تمام متون باید به زبان فارسی باشند.
    `;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] },
    ];

    try {
        const completion = await client.chat.completions.create({
            ...commonChatCompletionParams,
            messages,
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        const totalTokens = completion.usage?.total_tokens ?? 0;

        if (!rawText) {
            throw new Error("Empty response received from AvalAI.");
        }

        let data: ColorHarmonyResult;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("JSON Parse Error (getColorHarmonySuggestions):", parseError);
            console.error("Raw Text (getColorHarmonySuggestions):", rawText);
            throw new Error("Failed to parse AI response as JSON for getColorHarmonySuggestions.");
        }
        return { data, totalTokens };
    } catch (err: any) {
        console.error("AvalAI Service Error (getColorHarmonySuggestions):", err);
        throw new Error(handleAvalAIError(err));
    }
}

export async function findNearbySalons(locationQuery: string): Promise<{ data: Salon[]; totalTokens: number }> {
    const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        خروجی شما باید یک آرایه JSON با ساختار هر شیء دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
    `;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "user", content: prompt },
    ];

    try {
        const completion = await client.chat.completions.create({
            ...commonChatCompletionParams,
            messages,
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        const totalTokens = completion.usage?.total_tokens ?? 0;

        if (!rawText) {
            throw new Error("Empty response received from AvalAI.");
        }

        let data: Salon[];
        try {
            data = JSON.parse(rawText);
            // Special handling for salon results to ensure sorting, as the model might not always strictly adhere.
            if (Array.isArray(data)) {
                data.sort((a: Salon, b: Salon) => (b.rating ?? 0) - (a.rating ?? 0));
            }
        } catch (parseError) {
            console.error("JSON Parse Error (findNearbySalons):", parseError);
            console.error("Raw Text (findNearbySalons):", rawText);
            throw new Error("Failed to parse AI response as JSON for findNearbySalons.");
        }
        return { data, totalTokens };
    } catch (err: any) {
        console.error("AvalAI Service Error (findNearbySalons):", err);
        throw new Error(handleAvalAIError(err));
    }
}


function handleAvalAIError(err: any): string {
    let errorMessage = 'خطایی ناشناخته در هنگام ارتباط با AvalAI رخ داد.';
    if (err.name === 'APIError' || err.status) { // Check for OpenAI APIError structure
        if (err.status === 401) {
            errorMessage = "خطا در احراز هویت API: کلید AvalAI API نامعتبر است. لطفاً از صحیح بودن کلید اطمینان حاصل کنید.";
        } else if (err.status === 429) {
            errorMessage = "محدودیت نرخ (Rate Limit) اعمال شد: شما درخواست‌های زیادی ارسال کرده‌اید. لطفاً کمی صبر کنید و دوباره تلاش کنید.";
        } else if (err.status >= 400 && err.status < 500) {
            errorMessage = `خطای سمت مشتری (${err.status}): ${err.message || "درخواست نامعتبر."}`;
        } else if (err.status >= 500) {
            errorMessage = `خطای سرور AvalAI (${err.status}): ${err.message || "خطایی در سرور AvalAI رخ داد. لطفاً دوباره تلاش کنید."}`;
        } else {
             errorMessage = `خطای API: ${err.message || "جزئیات خطا نامشخص است."}`;
        }
    } else if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = "خطا در اتصال شبکه. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.";
    } else if (err instanceof Error) {
        errorMessage = err.message;
    }
    return errorMessage;
}