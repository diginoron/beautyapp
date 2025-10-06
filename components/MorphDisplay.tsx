import React from 'react';
import type { MorphResult } from '../types';
import { LightBulbIcon } from './icons';

interface MorphDisplayProps {
    result: MorphResult;
    sourcePreview: string;
    targetPreview: string;
    onReset: () => void;
    onBack: () => void;
}

const MorphDisplay: React.FC<MorphDisplayProps> = ({ result, sourcePreview, targetPreview, onReset, onBack }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-extrabold text-center text-slate-800">پیشنهادات برای تغییر چهره</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="flex flex-col items-center">
                    <img src={sourcePreview} alt="چهره مبدا" className="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-slate-300 mb-2"/>
                    <p className="font-semibold text-slate-700">چهره شما (مبدا)</p>
                </div>
                 <div className="flex flex-col items-center">
                    <img src={targetPreview} alt="چهره هدف" className="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-slate-300 mb-2"/>
                    <p className="font-semibold text-slate-700">چهره هدف</p>
                </div>
            </div>

            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center mb-4">
                    <LightBulbIcon className="w-6 h-6 text-cyan-400 ml-3" />
                    <h3 className="text-2xl font-extrabold text-slate-800">خلاصه تحلیل</h3>
                </div>
                <p className="text-slate-700 font-light">{result.summary}</p>
            </div>

            <div>
                 <h3 className="text-2xl font-extrabold text-slate-800 mb-4 text-center">پیشنهادات جزئی</h3>
                <ul className="space-y-3">
                    {result.suggestions.map((item, index) => (
                        <li key={index} className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-cyan-600 mb-2">{item.feature}</h4>
                            <p className="text-slate-700 font-light">{item.suggestion}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-center pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                >
                    بازگشت به خانه
                </button>
                <button
                    onClick={onReset}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 transform hover:scale-105"
                >
                    تحلیل جدید
                </button>
            </div>
        </div>
    );
};

export default MorphDisplay;