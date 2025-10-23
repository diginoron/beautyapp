import { supabase } from './supabase';
import type { AnalysisResult, HistoryItem } from '../types';

// Helper function to convert base64 to a Blob
const base64ToBlob = (base64: string, contentType: string = 'image/jpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};


export const saveAnalysis = async (userId: string, result: AnalysisResult, base64Image: string): Promise<void> => {
    try {
        // 1. Convert base64 to a file object to upload
        const imageBlob = base64ToBlob(base64Image);
        const filePath = `${userId}/${Date.now()}.jpeg`;

        // 2. Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('analysis-images')
            .upload(filePath, imageBlob);

        if (uploadError) {
            // Re-throw specific "Bucket not found" errors to provide clearer feedback.
            if (uploadError.message.includes('Bucket not found')) {
                 throw new Error("سطل ذخیره‌سازی 'analysis-images' یافت نشد. لطفاً از ایجاد آن در پنل Supabase خود اطمینان حاصل کنید.");
            }
            throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // 3. Save analysis result to the database
        const { error: insertError } = await supabase
            .from('analysis_history')
            .insert({
                user_id: userId,
                harmony_score: result.harmonyScore,
                feature_analysis: result.featureAnalysis,
                suggestions: result.suggestions,
                image_path: filePath,
            });

        if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

    } catch (error) {
        console.error("Error saving analysis:", error);
        // Propagate the error to be handled by the UI component.
        throw error;
    }
};

export const getAnalysisHistory = async (userId: string): Promise<HistoryItem[]> => {
    try {
        const { data: historyData, error: fetchError } = await supabase
            .from('analysis_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (fetchError) {
            throw new Error(`Failed to fetch history: ${fetchError.message}`);
        }

        if (!historyData) {
            return [];
        }

        // Create public URLs for all images
        const historyItems = await Promise.all(
            historyData.map(async (item) => {
                const { data: { publicUrl } } = supabase.storage
                    .from('analysis-images')
                    .getPublicUrl(item.image_path);
                
                return {
                    id: item.id,
                    created_at: item.created_at,
                    harmony_score: item.harmony_score,
                    feature_analysis: item.feature_analysis,
                    suggestions: item.suggestions,
                    image_url: publicUrl,
                };
            })
        );
        
        return historyItems;

    } catch (error) {
        console.error("Error getting analysis history:", error);
        throw error;
    }
};