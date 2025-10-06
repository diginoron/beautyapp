import React from 'react';
import type { ColorHarmonyResult, ColorPalette } from '../types';
import { PaletteIcon } from './icons';

interface ColorHarmonyDisplayProps {
    result: ColorHarmonyResult;
    imagePreview: string;
    onReset: () => void;
    onBack: () => void;
}

const PaletteCard: React.FC<{ palette: ColorPalette }> = ({ palette }) => (
    <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 backdrop-blur-sm">
        <h4 className="text-xl font-semibold text-amber-600 mb-3">{palette.name}</h4>
        <div className="flex space-x-2 mb-4">
            {palette.colors.map((color, index) => (
                <div 
                    key={index} 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                    title={color}
                />
            ))}
        </div>
        <p className="text-slate-700 text-sm leading-relaxed font-light">{palette.description}</p>
    </div>
);


const ColorHarmonyDisplay: React.FC<ColorHarmonyDisplayProps> = ({ result, imagePreview, onReset, onBack }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-extrabold text-center text-slate-800">تحلیل هماهنگی رنگ شما</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-6 bg-slate-100 rounded-xl border border-slate-200">
                <img src={imagePreview} alt="چهره شما" className="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-slate-300"/>
                <div className="text-center md:text-right">
                     <div className="flex items-center justify-center md:justify-start mb-2">
                        <PaletteIcon className="w-6 h-6 text-amber-500 ml-2" />
                        <h3 className="text-2xl font-extrabold text-slate-800">خلاصه تحلیل</h3>
                    </div>
                    <p className="text-slate-700 max-w-md font-light">{result.summary}</p>
                </div>
            </div>

            <div>
                 <h3 className="text-2xl font-extrabold text-slate-800 mb-4 text-center">پالت‌های رنگی پیشنهادی</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {result.palettes.map((palette, index) => (
                        <PaletteCard key={index} palette={palette} />
                    ))}
                </div>
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
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                    تحلیل دوباره
                </button>
            </div>
        </div>
    );
};

export default ColorHarmonyDisplay;