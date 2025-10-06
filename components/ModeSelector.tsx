import React from 'react';
import { FaceIcon, UsersIcon, FaceMagicIcon, PaletteIcon, MapPinIcon } from './icons';

interface ModeSelectorProps {
    onSelectMode: (mode: 'single' | 'compare' | 'morph' | 'color' | 'salonFinder') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 animate-fade-in">
            <button
                onClick={() => onSelectMode('single')}
                className="w-full h-44 flex flex-col items-center justify-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <FaceIcon className="w-10 h-10 text-indigo-500 mb-2" />
                <span className="text-lg font-semibold text-slate-800 text-center">تحلیل تک چهره</span>
                <p className="text-xs text-slate-500 mt-1 text-center font-light">امتیاز زیبایی و تحلیل دقیق اجزای چهره.</p>
            </button>
            <button
                onClick={() => onSelectMode('compare')}
                className="w-full h-44 flex flex-col items-center justify-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
                <UsersIcon className="w-10 h-10 text-teal-500 mb-2" />
                <span className="text-lg font-semibold text-slate-800 text-center">مقایسه دو چهره</span>
                <p className="text-xs text-slate-500 mt-1 text-center font-light">مقایسه امتیاز هماهنگی و ویژگی‌های دو چهره.</p>
            </button>
             <button
                onClick={() => onSelectMode('morph')}
                className="w-full h-44 flex flex-col items-center justify-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <FaceMagicIcon className="w-10 h-10 text-cyan-500 mb-2" />
                <span className="text-lg font-semibold text-slate-800 text-center">پیشنهاد برای تغییر چهره</span>
                 <p className="text-xs text-slate-500 mt-1 text-center font-light">پیشنهاداتی برای شبیه‌تر شدن به چهره دلخواه.</p>
            </button>
             <button
                onClick={() => onSelectMode('color')}
                className="w-full h-44 flex flex-col items-center justify-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
                <PaletteIcon className="w-10 h-10 text-amber-500 mb-2" />
                <span className="text-lg font-semibold text-slate-800 text-center">تحلیل هماهنگی رنگ</span>
                <p className="text-xs text-slate-500 mt-1 text-center font-light">پالت‌های رنگی هماهنگ با پوست و موی شما.</p>
            </button>
            <button
                onClick={() => onSelectMode('salonFinder')}
                className="w-full h-44 flex flex-col items-center justify-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 md:col-span-2 lg:col-span-1"
            >
                <MapPinIcon className="w-10 h-10 text-pink-500 mb-2" />
                <span className="text-lg font-semibold text-slate-800 text-center">سالن‌یاب</span>
                <p className="text-xs text-slate-500 mt-1 text-center font-light">بهترین سالن‌های زیبایی نزدیک خود را پیدا کنید.</p>
            </button>
        </div>
    );
};

export default ModeSelector;