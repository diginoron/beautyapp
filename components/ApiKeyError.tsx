
import React from 'react';
import { LockIcon } from './icons';

const ApiKeyError: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 animate-fade-in text-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-red-300">
                <LockIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-extrabold text-slate-800 mb-4">
                    نیاز به کلید API
                </h1>
                <p className="text-slate-600 text-lg mb-6">
                    کلید API برای سرویس هوش مصنوعی (Gemini) تنظیم نشده است. برای فعال‌سازی تحلیل چهره، لطفاً این کلید را در تنظیمات پروژه خود اضافه کنید.
                </p>
                <div className="bg-slate-50 p-6 rounded-lg text-right border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-2">راهنمای تنظیم در Vercel (یا پلتفرم مشابه):</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                        <li>به داشبورد پروژه خود در Vercel بروید.</li>
                        <li>وارد بخش <strong>Settings</strong> و سپس <strong>Environment Variables</strong> شوید.</li>
                        <li>یک متغیر جدید با اطلاعات زیر ایجاد کنید:</li>
                    </ol>
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm">NAME:</label>
                            <code className="block bg-slate-200 p-2 rounded-md mt-1 text-sm text-slate-900 select-all">
                                GEMINI_API_KEY
                            </code>
                        </div>
                        <div>
                            <label className="font-semibold text-sm">VALUE:</label>
                             <p className="text-xs text-slate-500 mb-1">
                                کلید API که از Google AI Studio دریافت کرده‌اید را اینجا قرار دهید.
                            </p>
                            <code className="block bg-slate-200 p-2 rounded-md text-sm text-slate-500 select-none">
                                AIza...
                            </code>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mt-6">
                    پس از ذخیره متغیر، پروژه خود را مجدداً <strong>Redeploy</strong> کنید تا تغییرات اعمال شود.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyError;
