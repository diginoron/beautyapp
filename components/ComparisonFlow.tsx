import React, { useState, useCallback } from 'react';
import * as avalaiService from '../services/avalaiService'; // Use new direct AvalAI service
import type { AnalysisResult, User } from '../types';
import { checkUserStatus, deductTokens, incrementUsageCount } from '../services/profileService';
import ImageInput from './ImageInput';
import Spinner from './Spinner';
import ComparisonDisplay from './ComparisonDisplay';

interface ComparisonFlowProps {
    currentUser: User;
    onBack: () => void;
    onTokensUsed: (count: number) => void;
}

type ImageData = {
    base64: string;
    preview: string;
} | null;

const ComparisonFlow: React.FC<ComparisonFlowProps> = ({ currentUser, onBack, onTokensUsed }) => {
    const [image1, setImage1] = useState<ImageData>(null);
    const [image2, setImage2] = useState<ImageData>(null);
    const [analysis1, setAnalysis1] = useState<AnalysisResult | null>(null);
    const [analysis2, setAnalysis2] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = useCallback(async () => {
        if (!image1 || !image2) {
            setError('لطفاً هر دو تصویر را برای مقایسه انتخاب کنید.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis1(null);
        setAnalysis2(null);

        try {
            // Check user status before proceeding
            const status = await checkUserStatus(currentUser.id);
            if (!status.canProceed) {
                setError(status.message);
                setIsLoading(false);
                return;
            }

            const [res1, res2] = await Promise.all([
                avalaiService.analyzeImage(image1.base64),
                avalaiService.analyzeImage(image2.base64),
            ]);
            
            const totalTokens = res1.totalTokens + res2.totalTokens;
            onTokensUsed(totalTokens);
            await deductTokens(currentUser.id, totalTokens);
            // Increment usage for each successful analysis
            await incrementUsageCount(currentUser.id);
            await incrementUsageCount(currentUser.id);


            const result1 = res1.data;
            const result2 = res2.data;

            let errors: string[] = [];
            if (!result1.isValidFace) {
                errors.push(`چهره اول: ${result1.errorMessage || 'چهره‌ای معتبر شناسایی نشد.'}`);
            }
            if (!result2.isValidFace) {
                errors.push(`چهره دوم: ${result2.errorMessage || 'چهره‌ای معتبر شناسایی نشد.'}`);
            }

            if (errors.length > 0) {
                setError(errors.join('\n'));
            } else {
                setAnalysis1(result1);
                setAnalysis2(result2);
            }

        } catch (err) {
            console.error("Comparison analysis error:", String(err));
            if (err instanceof Error) {
                setError(err.message);
            } else {
                 setError('خطایی در هنگام تحلیل تصاویر رخ داد. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [image1, image2, onTokensUsed, currentUser.id]);
    
    const handleReset = () => {
        setImage1(null);
        setImage2(null);
        setAnalysis1(null);
        setAnalysis2(null);
        setError(null);
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-indigo-500 animate-pulse">در حال تحلیل هر دو چهره...</p>
            </div>
        );
    }

    if (analysis1 && analysis2 && image1 && image2) {
        return <ComparisonDisplay result1={analysis1} imagePreview1={image1.preview} result2={analysis2} imagePreview2={image2.preview} onReset={handleReset} onBack={onBack} />;
    }

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageInput label="چهره اول" onImageSet={(base64, preview) => setImage1({ base64, preview })} />
                <ImageInput label="چهره دوم" onImageSet={(base64, preview) => setImage2({ base64, preview })} />
            </div>
            
             {error && (
                 <div className="text-center mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-semibold whitespace-pre-line">{error}</p>
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
                    onClick={handleCompare}
                    disabled={!image1 || !image2}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    مقایسه کن
                </button>
            </div>
        </div>
    );
};

export default ComparisonFlow;