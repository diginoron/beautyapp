import React, { useState } from 'react';
import type { AnalysisResult, FeatureAnalysis } from '../types';
import { CheckCircleIcon, LightBulbIcon, SparklesIcon, ShareIcon } from './icons';
import ShareModal from './ShareModal';

interface AnalysisDisplayProps {
    result: AnalysisResult;
    imagePreview: string;
    onReset: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (score / 10) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                />
                <circle
                    className="text-indigo-500"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800">{score.toFixed(1)}</span>
                <span className="text-sm text-slate-500">/ 10</span>
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ item: FeatureAnalysis }> = ({ item }) => (
    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-indigo-600 mb-2">{item.feature}</h4>
        <p className="text-slate-600 text-sm font-light">{item.analysis}</p>
    </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, imagePreview, onReset }) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <>
            <div className="animate-fade-in space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        <img src={imagePreview} alt="Analyzed face" className="w-48 h-48 object-cover rounded-full shadow-lg border-4 border-slate-300 mb-4"/>
                        <h3 className="text-xl font-semibold">امتیاز هماهنگی چهره</h3>
                        <ScoreCircle score={result.harmonyScore} />
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-yellow-400 ml-3" />
                            <h3 className="text-2xl font-extrabold text-slate-800">تحلیل اجزای چهره</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {result.featureAnalysis.map((item, index) => (
                               <FeatureCard key={index} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div>
                     <div className="flex items-center mb-4">
                        <LightBulbIcon className="w-6 h-6 text-blue-400 ml-3" />
                        <h3 className="text-2xl font-extrabold text-slate-800">پیشنهادات برای بهبود</h3>
                    </div>
                    <ul className="space-y-3">
                        {result.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start p-3 bg-slate-100 rounded-lg">
                               <CheckCircleIcon className="w-5 h-5 text-green-400 ml-3 mt-1 flex-shrink-0" />
                                <span className="text-slate-700 font-light">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-center pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={onReset}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                    >
                        تحلیل یک چهره دیگر
                    </button>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                        aria-label="Share results"
                    >
                        <ShareIcon className="w-5 h-5 ml-2" />
                        اشتراک‌گذاری
                    </button>
                </div>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                result={result}
            />
        </>
    );
};

export default AnalysisDisplay;