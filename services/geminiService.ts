import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

/**
 * A centralized function to call our backend API proxy.
 * This function includes a 60-second client-side timeout.
 * @param action The specific API action to perform.
 * @param params The parameters for the action.
 * @returns A promise that resolves with the JSON response from the proxy.
 * @throws Throws a user-friendly error on failure.
 */
async function callApiProxy<T>(action: string, params: object): Promise<T> {
    const controller = new AbortController();
    // 60-second client-side timeout for the entire request lifecycle.
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, params }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseData = await response.json();

        if (!response.ok) {
            // Throw an error with the specific message from the server's response
            throw new Error(responseData.error || `خطای سرور: ${response.status}`);
        }

        return responseData as T;

    } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof Error) {
            if (err.name === 'AbortError') {
                throw new Error('پاسخ از سرور در زمان مقرر دریافت نشد (Timeout). لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.');
            }
             // Suggest VPN for generic network errors, which is common for the target audience.
            if (err.message.toLowerCase().includes('failed to fetch')) {
                 throw new Error("خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.");
            }
        }
        // Re-throw the original error (e.g., from the server)
        throw err;
    }
}

export const analyzeImage = (base64Image: string): Promise<AnalysisResult> => {
    return callApiProxy('analyzeImage', { base64Image });
};

export const getMorphSuggestions = (sourceImageBase64: string, targetImageBase64: string): Promise<MorphResult> => {
     return callApiProxy('getMorphSuggestions', { sourceImageBase64, targetImageBase64 });
};

export const getColorHarmonySuggestions = (base64Image: string): Promise<ColorHarmonyResult> => {
    return callApiProxy('getColorHarmonySuggestions', { base64Image });
};

export const findNearbySalons = (locationQuery: string): Promise<Salon[]> => {
    return callApiProxy('findNearbySalons', { locationQuery });
};
