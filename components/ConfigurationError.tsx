import React from 'react';
import { FaceIcon } from './icons';

const ConfigurationError: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 animate-fade-in text-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-red-300">
                <FaceIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold text-slate-800 mb-4">
                    نیاز به پیکربندی
                </h1>
                <p className="text-slate-600 text-lg mb-6">
                    برنامه هنوز به پایگاه داده متصل نشده است. برای فعال‌سازی کامل برنامه، لطفاً مراحل زیر را دنبال کنید.
                </p>
                <div className="bg-slate-50 p-6 rounded-lg text-right border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-2">مرحله ۱: فایل را باز کنید</p>
                    <p className="mb-4">
                        فایل زیر را در ویرایشگر کد خود باز کنید:
                        <code className="block bg-slate-200 p-2 rounded-md mt-2 text-sm text-slate-900 select-all">
                            services/supabase.ts
                        </code>
                    </p>
                    <p className="font-semibold text-slate-800 mb-2">مرحله ۲: اطلاعات را جایگزین کنید</p>
                    <p>
                        دستورالعمل‌های داخل فایل را دنبال کرده و مقادیر نمونه را با <strong className="text-indigo-600">URL</strong> و <strong className="text-indigo-600">کلید anon</strong> واقعی پروژه Supabase خود جایگزین کنید.
                    </p>
                </div>
                <p className="text-sm text-slate-500 mt-6">
                    پس از ذخیره تغییرات، صفحه را مجدداً بارگذاری کنید.
                </p>
            </div>
        </div>
    );
};

export default ConfigurationError;
