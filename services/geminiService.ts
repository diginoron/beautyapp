import type { AnalysisResult, MorphResult, ColorHarmonyResult, Salon } from '../types';

/**
 * A helper function to call our backend API endpoint which acts as a proxy.
 * @param action The name of the function to execute on the backend.
 * @param params The parameters for that function.
 * @returns The JSON response from the backend.
 */
async function callApi(action: string, params: object): Promise<any> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the backend, or a default one.
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    
    return data;

  } catch (err) {
    console.error(`API call for action '${action}' failed:`, err);
    // Re-throw a user-friendly error to be caught by the component's try-catch block
    if (err instanceof Error) {
        if (err.message.toLowerCase().includes('failed to fetch')) {
             throw new Error("خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید. ممکن است سرور موقتاً در دسترس نباشد.");
        }
        // Pass the backend's error message through
        throw new Error(err.message);
    }
    throw new Error('یک خطای ناشناخته در ارتباط با سرور رخ داد.');
  }
}


export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  return callApi('analyzeImage', { base64Image });
};

export const getMorphSuggestions = async (sourceImageBase64: string, targetImageBase64: string): Promise<MorphResult> => {
  return callApi('getMorphSuggestions', { sourceImageBase64, targetImageBase64 });
};

export const getColorHarmonySuggestions = async (base64Image: string): Promise<ColorHarmonyResult> => {
  return callApi('getColorHarmonySuggestions', { base64Image });
};

export const findNearbySalons = async (locationQuery: string): Promise<Salon[]> => {
  return callApi('findNearbySalons', { locationQuery });
};
