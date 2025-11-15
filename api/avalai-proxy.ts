import { OpenAI } from "openai";
import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

// Vercel serverless function handler
export default async function handler(req: Request) {
    // Set CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
    }

    if (!process.env.AVALAI_API_KEY) {
        return new Response(JSON.stringify({ error: "AVALAI_API_KEY is not configured on the server." }), { status: 500, headers });
    }

    const client = new OpenAI({
        apiKey: process.env.AVALAI_API_KEY,
        baseURL: "https://api.avalai.ir/v1", // AvalAI API endpoint
    });

    try {
        const { type, payload } = await req.json();

        let prompt: string;
        let imageParts: any[] = [];
        let model = "gemini-2.5-flash"; // As requested, using gemini-2.5-flash

        switch (type) {
            case 'analyzeImage': {
                const { base64Image } = payload;
                prompt = `
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
                imageParts.push({ type: "image_url", image_url: `data:image/jpeg;base64,${base64Image}` });
                break;
            }
            case 'getMorphSuggestions': {
                const { sourceImageBase64, targetImageBase64 } = payload;
                prompt = `
                    شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
                    دستورالعمل‌های دقیق:
                    ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
                    ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است: مدل، رنگ و حالت مو، فرم‌دهی و آرایش ابروها، تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب)، کانتورینگ و هایلایتینگ، مدل ریش و سبیل، و استفاده از اکسسوری‌ها. **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
                    ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
                    ۴. **پیشنهادات جزئی و مقایسه‌ای:** برای هر جزء، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء ارائه دهید.
                    ۵. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValid": boolean, "errorMessage": string | null, "summary": string, "suggestions": [{ "feature": string, "suggestion": string }] }. تمام متون باید به زبان فارسی باشد.
                `;
                imageParts.push({ type: "image_url", image_url: `data:image/jpeg;base64,${sourceImageBase64}` });
                imageParts.push({ type: "image_url", image_url: `data:image/jpeg;base64,${targetImageBase64}` });
                break;
            }
            case 'getColorHarmonySuggestions': {
                const { base64Image } = payload;
                prompt = `
                    شما یک هوش مصنوعی متخصص در تئوری رنگ و استایلیست شخصی هستید. وظیفه شما تحلیل دقیق چهره در تصویر ارسالی و ارائه پیشنهادهای هماهنگی رنگ است.
                    دستورالعمل‌ها:
                    ۱. **اعتبارسنجی چهره:** ابتدا بررسی کنید که تصویر حاوی یک چهره انسانی واضح است. اگر نه، isValidFace را false و errorMessage را با یک دلیل مناسب پر کنید.
                    ۲. **تحلیل ویژگی‌ها:** تناژ پوست (گرم، سرد، یا خنثی)، رنگ مو، و رنگ چشم‌ها را از تصویر تشخیص دهید.
                    ۳. **خلاصه تحلیل:** در فیلد 'summary'، یک خلاصه کوتاه و مفید از ویژگی‌های تحلیل شده به زبان فارسی ارائه دهید.
                    ۴. **ارائه پالت‌های رنگی:** سه پالت رنگی متمایز و هماهنگ با ویژگی‌های چهره پیشنهاد دهید.
                    ۵. **جزئیات هر پالت:** برای هر پالت، یک 'name' خلاقانه، یک 'description' (توضیح هماهنگی)، و یک آرایه 'colors' شامل دقیقاً ۵ کد رنگ هگزادسیمال (مانند "#RRGGBB") ارائه دهید.
                    ۶. **فرمت خروجی:** خروجی شما باید یک شیء JSON با ساختار دقیقاً به این شکل باشد: { "isValidFace": boolean, "errorMessage": string | null, "summary": string, "palettes": [{ "name": string, "description": string, "colors": [string] }] }. تمام متون باید به زبان فارسی باشند.
                `;
                imageParts.push({ type: "image_url", image_url: `data:image/jpeg;base64,${base64Image}` });
                break;
            }
            case 'findNearbySalons': {
                const { locationQuery } = payload;
                prompt = `
                    شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن ۱۰ مورد از برترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر ("${locationQuery}") است.
                    این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
                    خروجی شما باید یک آرایه JSON با ساختار هر شیء دقیقاً به این شکل باشد: { "name": string, "address": string, "phone": string, "rating": number }.
                `;
                break; // No image for salon finder
            }
            default:
                return new Response(JSON.stringify({ error: 'Unknown API type' }), { status: 400, headers });
        }

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "user", content: [{ type: "text", text: prompt }, ...imageParts] },
        ];
        
        const completion = await client.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.3, // Default temperature, can be adjusted per task if needed
            response_format: { type: "json_object" } // Request JSON object for structured responses
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        const totalTokens = completion.usage?.total_tokens ?? 0;

        if (!rawText) {
            throw new Error("Empty response received from AvalAI.");
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw Text:", rawText);
            throw new Error("Failed to parse AI response as JSON.");
        }

        // Special handling for salon results to ensure sorting, as the model might not always strictly adhere.
        if (type === 'findNearbySalons' && Array.isArray(data)) {
            data.sort((a: Salon, b: Salon) => (b.rating ?? 0) - (a.rating ?? 0));
        }

        return new Response(JSON.stringify({ data, totalTokens }), { status: 200, headers });

    } catch (err: any) {
        console.error("AvalAI Proxy Error:", err);
        let errorMessage = 'An unknown error occurred while communicating with AvalAI.';
        if (err instanceof Error) {
            if (err.message.includes("API key")) {
                errorMessage = "API key configuration error on the server.";
            } else if (err.message.toLowerCase().includes('safety')) {
                errorMessage = "The response was blocked due to safety restrictions. Please try a different image or text.";
            } else if (err.message.toLowerCase().includes('fetch')) {
                errorMessage = "Connection error to AvalAI server. Please check your internet connection and try again. A VPN might be required.";
            } else if (err.message.includes("Failed to parse AI response as JSON")) {
                errorMessage = "The AI returned an unparseable response. Please try again.";
            } else {
                errorMessage = err.message;
            }
        }
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers });
    }
}