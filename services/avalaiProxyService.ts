// This file acts as a frontend service to call the AvalAI proxy serverless function.

const PROXY_URL = '/api/avalai-proxy'; // The endpoint for our Vercel serverless function

/**
 * Calls the AvalAI proxy serverless function with a specified API type and payload.
 *
 * @param type The type of AI operation (e.g., 'analyzeImage', 'getMorphSuggestions').
 * @param payload The data specific to the AI operation (e.g., base64 images, location query).
 * @returns A promise that resolves with the AI response data and total tokens used.
 * @throws Throws an error if the network request fails or the proxy returns an error.
 */
export async function callAvalAIProxy<T>(type: string, payload: any): Promise<T> {
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`AvalAI Proxy Error (${response.status}):`, errorData.error);
            // Translate common errors into user-friendly messages
            if (response.status === 500 && errorData.error.includes("API key")) {
                 throw new Error("پیکربندی کلید API در سرور مشکل دارد. لطفاً با پشتیبانی تماس بگیرید.");
            }
            if (errorData.error.includes("Connection error")) {
                throw new Error("خطا در اتصال به سرور هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.");
            }
            throw new Error(errorData.error || 'خطایی در هنگام ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.');
        }

        const data = await response.json();
        return data as T;

    } catch (err) {
        console.error("Frontend AvalAI Proxy Call Error:", err);
        if (err instanceof Error) {
            throw err; // Re-throw the custom error messages
        }
        throw new Error('خطایی ناشناخته در هنگام ارتباط با سرور هوش مصنوعی رخ داد. لطفاً دوباره تلاش کنید.');
    }
}