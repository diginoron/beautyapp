import React from 'react';
import type { AnalysisResult } from '../types';
import { CrownIcon } from './icons';

interface ComparisonDisplayProps {
    result1: AnalysisResult;
    imagePreview1: string;
    result2: AnalysisResult;
    imagePreview2: string;
    onReset: () => void;
    onBack: () => void;
}

const ResultCard: React.FC<{ result: AnalysisResult; imagePreview: string; isWinner: boolean; label: string; }> = ({ result, imagePreview, isWinner, label }) => {
    const borderColor = isWinner ? 'border-yellow-400' : 'border-slate-300';
    const bgColor = isWinner ? 'bg-yellow-50' : 'bg-white/60';

    return (
        <div className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-500`}>
            <h3 className="text-xl font-semibold text-center mb-4 text-slate-700">{label}</h3>
            <div className="relative">
                <img src={imagePreview} alt="Analyzed face" className="w-40 h-40 object-cover rounded-full mx-auto shadow-lg border-4 border-slate-300 mb-4"/>
                {isWinner && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 transform">
                       <CrownIcon className="w-10 h-10 text-yellow-400" style={{ filter: 'drop-shadow(0 0 5px rgba(250, 204, 21, 0.7))' }}/>
                    </div>
                )}
            </div>
            <div className="text-center">
                 <p className="text-sm text-slate-500 font-light">امتیاز هماهنگی</p>
                 <p className="text-4xl font-bold text-slate-800 my-1">{result.harmonyScore.toFixed(1)} <span className="text-2xl text-slate-500">/ 10</span></p>
            </div>
            <div className="mt-4 text-center">
                <h4 className="font-semibold text-indigo-600 mb-2">ویژگی‌های برجسته</h4>
                <p className="text-slate-600 text-sm font-light">{result.featureAnalysis.slice(0, 2).map(f => f.feature).join('، ')}</p>
            </div>
        </div>
    );
};


const ComparisonDisplay: React.FC<ComparisonDisplayProps> = ({ result1, imagePreview1, result2, imagePreview2, onReset, onBack }) => {
    const winner = result1.harmonyScore > result2.harmonyScore ? 1 : (result2.harmonyScore > result1.harmonyScore ? 2 : 0);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-800">نتایج مقایسه</h2>
                {winner === 0 && <p className="text-xl font-light text-indigo-600 mt-2">امتیازها برابر شد! هر دو چهره هماهنگی بالایی دارند.</p>}
                {winner === 1 && <p className="text-xl font-light text-indigo-600 mt-2">چهره اول هماهنگی بیشتری دارد.</p>}
                {winner === 2 && <p className="text-xl font-light text-indigo-600 mt-2">چهره دوم هماهنگی بیشتری دارد.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultCard result={result1} imagePreview={imagePreview1} isWinner={winner === 1} label="چهره اول" />
                <ResultCard result={result2} imagePreview={imagePreview2} isWinner={winner === 2} label="چهره دوم" />
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
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                    مقایسه جدید
                </button>
            </div>
        </div>
    );
};

export default ComparisonDisplay;