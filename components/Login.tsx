import React, { useState } from 'react';
import { MailIcon, LockIcon } from './icons';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
    onSwitchToSignup: () => void;
    onSwitchToForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged in App.tsx will handle successful login
        } catch (err: any) {
            console.error('Login Error:', { code: err.code, message: err.message });
            if (err.code === 'auth/invalid-api-key') {
                setError('پیکربندی برنامه نامعتبر است. لطفاً با مدیر سیستم تماس بگیرید.');
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('ایمیل یا رمز عبور نامعتبر است.');
            } else {
                setError('خطایی در فرآیند ورود رخ داد.');
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">ورود به حساب کاربری</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                
                <div className="relative">
                    <MailIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="ایمیل"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder:font-light"
                        required
                    />
                </div>

                <div className="relative">
                     <LockIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        placeholder="رمز عبور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder:font-light"
                        required
                    />
                </div>
                
                <div className="text-left">
                    <button type="button" onClick={onSwitchToForgotPassword} className="text-xs text-indigo-600 hover:underline">
                        رمز عبور خود را فراموش کرده‌اید؟
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                    ورود
                </button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-6">
                حساب کاربری ندارید؟{' '}
                <button onClick={onSwitchToSignup} className="font-semibold text-indigo-600 hover:underline">
                    ثبت‌نام کنید
                </button>
            </p>
        </div>
    );
};

export default Login;