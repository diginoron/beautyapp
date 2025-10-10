
import React from 'react';
import { FaceIcon } from './icons';

const GeminiConfigurationError: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 animate-fade-in text-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-red-300">
                <FaceIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold text-slate-800 mb-4">
                    نیاز به کلید API
                </h1>
                <p className="text-slate-600 text-lg mb-6">
                    برای اینکه برنامه بتواند با هوش مصنوعی ارتباط برقرار کند، به یک کلید API از Google AI Studio نیاز است.
                </p>
                <div className="bg-slate-50 p-6 rounded-lg text-right border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-2">مرحله: دریافت و تنظیم کلید</p>
                    <p>
                        لطفاً کلید API خود را از <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Google AI Studio</a> دریافت کرده و آن را به عنوان یک متغیر محیطی (environment variable) با نام <code className="bg-slate-200 p-1 rounded-md text-sm text-slate-900 select-all">GEMINI_API_KEY</code> در محیط اجرای پروژه خود تنظیم کنید.
                    </p>
                </div>
                 <p className="text-sm text-slate-500 mt-6">
                    پس از تنظیم کلید، صفحه را مجدداً بارگذاری کنید.
                </p>
            </div>
        </div>
    );
};

export default GeminiConfigurationError;
