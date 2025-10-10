import { GoogleGenAI, Type } from '@google/genai';

// --- Schemas for structured JSON responses ---

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        isValidFace: {
            type: Type.BOOLEAN,
            description: "اگر یک چهره انسانی واضح در تصویر شناسایی شود true، در غیر این صورت false.",
        },
        errorMessage: {
            type: Type.STRING,
            description: "یک پیام خطا در صورتی که چهره‌ای شناسایی نشود یا تصویر نامناسب باشد. اگر چهره‌ای شناسایی شود، این فیلد null خواهد بود.",
        },
        harmonyScore: {
            type: Type.INTEGER,
            description: "امتیاز هماهنگی چهره از ۱ تا ۱۰ بر اساس تقارن و تعادل. اگر چهره‌ای شناسایی نشود، این فیلد null خواهد بود.",
        },
        featureAnalysis: {
            type: Type.ARRAY,
            description: "تحلیل دقیق اجزای مختلف چهره به زبان فارسی.",
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: {
                        type: Type.STRING,
                        description: "نام جزء چهره به فارسی (مثلاً: چشم‌ها، بینی، لب‌ها)."
                    },
                    analysis: {
                        type: Type.STRING,
                        description: "یک تحلیل سازنده و مثبت از آن جزء به زبان فارسی."
                    },
                },
                required: ["feature", "analysis"],
            },
        },
        suggestions: {
            type: Type.ARRAY,
            description: "لیستی از پیشنهادات سازنده برای بهبود زیبایی به زبان فارسی.",
            items: {
                type: Type.STRING
            },
        },
    },
    required: ["isValidFace", "harmonyScore", "featureAnalysis", "suggestions"],
};

const morphSchema = {
    type: Type.OBJECT,
    properties: {
        isValid: {
            type: Type.BOOLEAN,
            description: "اگر در هر دو تصویر چهره‌های انسانی واضح شناسایی شود true، در غیر این صورت false."
        },
        errorMessage: {
            type: Type.STRING,
            description: "یک پیام خطا در صورتی که چهره‌ای در یک یا هر دو تصویر شناسایی نشود. در غیر این صورت null خواهد بود."
        },
        summary: {
            type: Type.STRING,
            description: "یک خلاصه کلی و مثبت از تغییرات پیشنهادی به زبان فارسی."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "لیستی از پیشنهادات مشخص برای تغییرات غیرتهاجمی به زبان فارسی.",
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING, description: "نام جزء چهره به فارسی (مثلاً: مو، پیشانی، ابروها، چشم‌ها، بینی، لب‌ها، خط فک)." },
                    suggestion: { type: Type.STRING, description: "پیشنهاد مشخص برای آن جزء به زبان فارسی." }
                },
                required: ["feature", "suggestion"]
            }
        }
    },
    required: ["isValid", "summary", "suggestions"]
};

const colorHarmonySchema = {
    type: Type.OBJECT,
    properties: {
        isValidFace: {
            type: Type.BOOLEAN,
            description: "اگر یک چهره انسانی واضح در تصویر شناسایی شود true، در غیر این صورت false."
        },
        errorMessage: {
            type: Type.STRING,
            description: "یک پیام خطا در صورتی که چهره‌ای شناسایی نشود. در غیر این صورت null خواهد بود."
        },
        summary: {
            type: Type.STRING,
            description: "یک خلاصه کوتاه از تحلیل ویژگی‌های چهره (تناژ پوست، رنگ مو و چشم) به زبان فارسی."
        },
        palettes: {
            type: Type.ARRAY,
            description: "لیستی از پالت‌های رنگی پیشنهادی.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "یک نام خلاقانه و توصیفی برای پالت رنگی به زبان فارسی." },
                    description: { type: Type.STRING, description: "توضیح اینکه چرا این پالت رنگی برای فرد مناسب است به زبان فارسی." },
                    colors: {
                        type: Type.ARRAY,
                        description: "آرایه‌ای از ۵ یا ۶ کد رنگ هگزادسیمال (شامل #) که پالت را تشکیل می‌ده دهند.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["name", "description", "colors"]
            }
        }
    },
    required: ["isValidFace", "summary", "palettes"]
};

const salonSchema = {
    type: Type.ARRAY,
    description: "لیستی از سالن‌های زیبایی زنانه.",
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "نام کامل سالن زیبایی."
            },
            address: {
                type: Type.STRING,
                description: "آدرس دقیق و کامل سالن."
            },
            phone: {
                type: Type.STRING,
                description: "شماره تماس سالن با کد شهر."
            },
            rating: {
                type: Type.NUMBER,
                description: "امتیاز کاربران در گوگل مپ (عددی بین ۱ تا ۵)."
            }
        },
        required: ["name", "address", "phone", "rating"]
    }
};


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
        ۶. کل خروجی شما باید اکیداً یک شیء JSON مطابق با اسکیمای ارائه شده باشد. هیچ متن اضافی یا قالب‌بندی مارک‌داون اضافه نکنید. تمام متن‌های تحلیل و پیشنهادات باید به زبان فارسی باشد.
    `;

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.3,
        }
    });

    return JSON.parse(response.text.trim());
}

async function getMorphSuggestionsHandler(ai: GoogleGenAI, params: { sourceImageBase64: string, targetImageBase64: string }) {
    const { sourceImageBase64, targetImageBase64 } = params;
    if (!sourceImageBase64 || !targetImageBase64) throw new Error("Missing source or target image parameter.");

    const prompt = `
        شما یک مشاور زیبایی حرفه‌ای و متخصص هوش مصنوعی هستید. وظیفه شما مقایسه دقیق دو چهره (چهره مبدا و چهره هدف) و ارائه پیشنهادات مشخص و کاربردی است تا چهره مبدا به چهره هدف شبیه‌تر شود. تمرکز مطلقاً بر روش‌های غیرتهاجمی است.
        دستورالعمل‌های دقیق:
        ۱. **اعتبارسنجی تصاویر:** ابتدا بررسی کنید که هر دو تصویر حاوی یک چهره انسانی واضح هستند. اگر نه، isValid را false و errorMessage را با دلیل مناسب پر کنید. در غیر این صورت، isValid را true قرار دهید.
        ۲. **ایمنی و محدودیت‌ها:** پیشنهادات شما باید ۱۰۰٪ غیرتهاجمی باشند. فقط موارد زیر مجاز است:
            - مدل، رنگ و حالت مو.
            - فرم‌دهی و آرایش ابروها.
            - تکنیک‌های آرایشی (مانند خط چشم، سایه، رژ لب).
            - کانتورینگ و هایلایتینگ برای تغییر ظاهری فرم بینی، پیشانی، گونه‌ها و خط فک.
            - مدل ریش و سبیل.
            - استفاده از اکسسوری‌ها مانند عینک.
            **ممنوعیت مطلق:** هیچ اشاره‌ای به جراحی، تزریق، یا هرگونه رویه پزشکی نکنید.
        ۳. **خلاصه مقایسه‌ای:** در فیلد 'summary'، یک خلاصه کلی ارائه دهید که تفاوت‌های کلیدی بین دو چهره را بیان کرده و به طور مثبت توضیح دهد که چگونه می‌توان با تغییرات پیشنهادی، چهره مبدا را به هدف نزدیک‌تر کرد.
        ۴. **پیشنهادات جزئی و مقایسه‌ای:** این مهم‌ترین بخش است. برای هر جزء در لیست (مو، پیشانی، ابروها، چشم‌ها، بینی، گونه‌ها، لب‌ها، خط فک)، ابتدا یک مقایسه کوتاه بین چهره مبدا و هدف انجام دهید. سپس، بر اساس آن مقایسه، یک پیشنهاد مشخص برای شبیه‌سازی آن جزء در چهره مبدا به چهره هدف ارائه دهید.
        ۵. **فرمت خروجی:** خروجی باید فقط یک شیء JSON مطابق با اسکیمای ارائه شده و تماماً به زبان فارسی باشد.
    `;
    
    const sourceImagePart = { inlineData: { mimeType: 'image/jpeg', data: sourceImageBase64 } };
    const targetImagePart = { inlineData: { mimeType: 'image/jpeg', data: targetImageBase64 } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, sourceImagePart, targetImagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: morphSchema,
            temperature: 0.4,
        }
    });

    return JSON.parse(response.text.trim());
}

async function getColorHarmonySuggestionsHandler(ai: GoogleGenAI, params: { base64Image: string }) {
    const { base64Image } = params;
    if (!base64Image) throw new Error("Missing 'base64Image' parameter.");

    const prompt = `
        شما یک هوش مصنوعی متخصص در تئوری رنگ و استایلیست شخصی هستید. وظیفه شما تحلیل دقیق چهره در تصویر ارسالی و ارائه پیشنهادهای هماهنگی رنگ است.
        دستورالعمل‌ها:
        ۱. **اعتبارسنجی چهره:** ابتدا بررسی کنید که تصویر حاوی یک چهره انسانی واضح است. اگر نه، isValidFace را false و errorMessage را با یک دلیل مناسب پر کنید. در غیر این صورت، isValidFace را true قرار دهید.
        ۲. **تحلیل ویژگی‌ها:** تناژ پوست (گرم، سرد، یا خنثی)، رنگ مو، و رنگ چشم‌ها را از تصویر تشخیص دهید.
        ۳. **خلاصه تحلیل:** در فیلد 'summary'، یک خلاصه کوتاه و مفید از ویژگی‌های تحلیل شده (تناژ پوست، رنگ مو و چشم) به زبان فارسی ارائه دهید.
        ۴. **ارائه پالت‌های رنگی:** سه پالت رنگی متمایز و هماهنگ با ویژگی‌های چهره پیشنهاد دهید.
        ۵. **جزئیات هر پالت:** برای هر پالت در آرایه 'palettes':
            - یک 'name' خلاقانه و توصیفی به زبان فارسی انتخاب کنید (مثلاً "گرمای پاییزی"، "آرامش اقیانوسی"، "بهار پرجنب‌وجوش").
            - یک 'description' بنویسید که به زبان فارسی توضیح دهد چرا این پالت رنگی با تناژ پوست، مو و چشم فرد هماهنگ است و چه حسی را منتقل می‌کند.
            - یک آرایه 'colors' شامل دقیقاً ۵ کد رنگ هگزادسیمال (مانند "#RRGGBB") که مکمل یکدیگر هستند ارائه دهید.
        ۶. **فرمت خروجی:** خروجی شما باید اکیداً یک شیء JSON مطابق با اسکیمای ارائه شده باشد. هیچ متن اضافی یا قالب‌بندی مارک‌داون خارج از JSON اضافه نکنید. تمام متون باید به زبان فارسی باشند.
    `;

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: colorHarmonySchema,
            temperature: 0.5,
        }
    });

    return JSON.parse(response.text.trim());
}

async function findNearbySalonsHandler(ai: GoogleGenAI, params: { locationQuery: string }) {
    const { locationQuery } = params;
    if (!locationQuery) throw new Error("Missing 'locationQuery' parameter.");

    const prompt = `
        شما یک دستیار جستجوی محلی هستید. وظیفه شما یافتن بهترین سالن‌های زیبایی زنانه بر اساس موقعیت مکانی کاربر است.
        بر اساس موقعیت ورودی کاربر ("${locationQuery}")، لطفاً ۱۰ مورد از برترین سالن‌های زیبایی زنانه در آن منطقه یا نزدیک به آن را لیست کنید.
        این لیست باید بر اساس بالاترین امتیاز کاربران در گوگل مپ مرتب شود (از بیشترین به کمترین).
        برای هر سالن، اطلاعات زیر را ارائه دهید:
        - name: نام کامل سالن
        - address: آدرس دقیق
        - phone: شماره تلفن (در صورت وجود)
        - rating: امتیاز کاربران در گوگل مپ (یک عدد)

        خروجی شما باید اکیداً یک آرایه JSON مطابق با اسکیمای ارائه شده باشد. هیچ متن اضافی یا قالب‌بندی دیگری اضافه نکنید.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: salonSchema,
            temperature: 0.2,
        }
    });

    const result = JSON.parse(response.text.trim());
    // Sort by rating just in case the model doesn't do it perfectly
    result.sort((a: {rating: number}, b: {rating: number}) => b.rating - a.rating);
    return result;
}
