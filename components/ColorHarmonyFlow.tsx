import React, { useState, useCallback } from 'react';
import * as avalaiService from '../services/avalaiService'; // Use new direct AvalAI service
import type { ColorHarmonyResult, User } from '../types';
import { checkUserStatus, deductTokens, incrementUsageCount } from '../services/profileService';
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import ColorHarmonyDisplay from './ColorHarmonyDisplay';

interface ColorHarmonyFlowProps {
    currentUser: User;
    onBack: () => void;
    onTokensUsed: (count: number) => void;
}

type ImageData = { base64: string; preview: string; } | null;

const ColorHarmonyFlow: React.FC<ColorHarmonyFlowProps> = ({ currentUser, onBack, onTokensUsed }) => {
    const [image, setImage] = useState<ImageData>(null);
    const [result, setResult] = useState<ColorHarmonyResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestions = useCallback(async () => {
        if (!image) {
            setError('لطفاً یک تصویر برای تحلیل انتخاب کنید.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const status = await checkUserStatus(currentUser.id);
            if (!status.canProceed) {
                setError(status.message);
                setIsLoading(false);
                return;
            }

            const { data: colorHarmonyData, totalTokens } = await avalaiService.getColorHarmonySuggestions(image.base64);
            onTokensUsed(totalTokens);
            await deductTokens(currentUser.id, totalTokens);
            await incrementUsageCount(currentUser.id);
            
            if (colorHarmonyData.isValidFace) {
                setResult(colorHarmonyData);
            } else {
                setError(colorHarmonyData.errorMessage || 'چهره‌ای معتبر در تصویر شناسایی نشد.');
            }
        } catch (err) {
            console.error("Color harmony suggestions error:", String(err));
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('خطایی در هنگام دریافت پیشنهادات رنگ رخ داد. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [image, onTokensUsed, currentUser.id]);

    const handleReset = () => {
        setImage(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-amber-500 animate-pulse">در حال تحلیل رنگ‌های چهره شما...</p>
            </div>
        );
    }

    if (result && image) {
        return <ColorHarmonyDisplay result={result} imagePreview={image.preview} onReset={handleReset} onBack={onBack} />;
    }

    return (
        <div className="animate-fade-in">
            <div className="max-w-md mx-auto">
                <ImageInput label="چهره شما" onImageSet={(base64, preview) => setImage({ base64, preview })} />
            </div>
            
             {error && (
                 <div className="text-center mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                >
                    بازگشت
                </button>
                <button
                    onClick={handleGetSuggestions}
                    disabled={!image}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    دریافت پالت‌های رنگی
                </button>
            </div>
        </div>
    );
};

export default ColorHarmonyFlow;