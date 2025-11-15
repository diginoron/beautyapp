
import React, { useState } from 'react';
import { MailIcon } from './icons';
import { supabase } from '../services/supabase';

interface ForgotPasswordProps {
    onSwitchToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError('لطفاً ایمیل خود را وارد کنید.');
            return;
        }
        
        try {
            // FIX: Added 'as any' type assertion to supabase.auth to resolve "Property 'resetPasswordForEmail' does not exist on type 'SupabaseAuthClient'."
            const { error } = await (supabase.auth as any).resetPasswordForEmail(email, {
                redirectTo: window.location.href.replace(/#.*$/, ''), // Redirect back to the app's base URL
            });
            if (error) throw error;

            setMessage('اگر حسابی با این ایمیل وجود داشته باشد، لینک بازنشانی رمز عبور برایتان ارسال شد. لطفاً پوشه اسپم را نیز بررسی کنید.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 4000);
        } catch (err: any) {
            console.error("Password reset error:", err.message);
            // For security, show the same message whether the user exists or not.
            setMessage('اگر حسابی با این ایمیل وجود داشته باشد، لینک بازنشانی رمز عبور برایتان ارسال شد. لطفاً پوشه اسپم را نیز بررسی کنید.');
             setTimeout(() => {
                onSwitchToLogin();
            }, 4000);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">بازیابی رمز عبور</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-md">{message}</p>}
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                
                <p className="text-sm text-center text-slate-600 font-light">
                   ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی را برایتان ارسال کنیم.
                </p>
                <div className="relative">
                    <MailIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="ایمیل"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light"
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!!message}
                    className="w-full px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
                >
                    ارسال لینک بازیابی
                </button>
            </form>
             <p className="text-center text-sm text-slate-600 mt-6">
                رمز خود را به خاطر آوردید؟{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-indigo-600 hover:underline">
                    بازگشت به ورود
                </button>
            </p>
        </div>
    );
};

export default ForgotPassword;
