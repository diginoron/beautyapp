
import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

/**
 * A centralized function to call our server-side API proxy.
 * @param action The specific API action to perform.
 * @param params The parameters for that action.
 * @returns The JSON response from the server.
 */
async function callApiProxy(action: string, params: object): Promise<any> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, params }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Use the error message from the server's JSON response, or a default one
            throw new Error(result.error || `خطای سرور: ${response.status}`);
        }

        return result;

    } catch (err) {
        console.error(`API proxy call for action '${action}' failed:`, err);
        if (err instanceof Error) {
            // Check for common network errors
            if (err.message.toLowerCase().includes('failed to fetch')) {
                 throw new Error("خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است نیاز به استفاده از ابزار تغییر IP (وی‌پی‌ان) باشد.");
            }
            // Re-throw other errors, including those from the server response
            throw err;
        }
        // Fallback for non-Error objects
        throw new Error('یک خطای ناشناخته در ارتباط با سرور رخ داد.');
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
