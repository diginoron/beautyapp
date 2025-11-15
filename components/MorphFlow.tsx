import React, { useState, useCallback } from 'react';
import * as avalaiService from '../services/avalaiService'; // Use new direct AvalAI service
import type { MorphResult, User } from '../types';
import { checkUserStatus, deductTokens, incrementUsageCount } from '../services/profileService';
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import MorphDisplay from './MorphDisplay';

interface MorphFlowProps {
    currentUser: User;
    onBack: () => void;
    onTokensUsed: (count: number) => void;
}

type ImageData = { base64: string; preview: string; } | null;

const MorphFlow: React.FC<MorphFlowProps> = ({ currentUser, onBack, onTokensUsed }) => {
    const [sourceImage, setSourceImage] = useState<ImageData>(null);
    const [targetImage, setTargetImage] = useState<ImageData>(null);
    const [result, setResult] = useState<MorphResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestions = useCallback(async () => {
        if (!sourceImage || !targetImage) {
            setError('لطفاً هر دو تصویر را برای دریافت پیشنهادات انتخاب کنید.');
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
            
            const { data: morphData, totalTokens } = await avalaiService.getMorphSuggestions(sourceImage.base64, targetImage.base64);
            onTokensUsed(totalTokens);
            await deductTokens(currentUser.id, totalTokens);
            await incrementUsageCount(currentUser.id);
            
            if (morphData.isValid) {
                setResult(morphData);
            } else {
                setError(morphData.errorMessage || 'چهره‌ای معتبر در یک یا هر دو تصویر شناسایی نشد.');
            }
        } catch (err) {
            console.error("Morph suggestions error:", String(err));
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('خطایی در هنگام دریافت پیشنهادات رخ داد. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage, targetImage, onTokensUsed, currentUser.id]);

    const handleReset = () => {
        setSourceImage(null);
        setTargetImage(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-cyan-500 animate-pulse">در حال تحلیل و یافتن پیشنهادات...</p>
            </div>
        );
    }

    if (result && sourceImage && targetImage) {
        return <MorphDisplay result={result} sourcePreview={sourceImage.preview} targetPreview={targetImage.preview} onReset={handleReset} onBack={onBack} />;
    }

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageInput label="چهره شما (مبدا)" onImageSet={(base64, preview) => setSourceImage({ base64, preview })} />
                <ImageInput label="چهره هدف" onImageSet={(base64, preview) => setTargetImage({ base64, preview })} />
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
                    disabled={!sourceImage || !targetImage}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    دریافت پیشنهادات
                </button>
            </div>
        </div>
    );
};

export default MorphFlow;