
import React, { useState } from 'react';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from './icons';
import { supabase } from '../services/supabase';
import Spinner from './Spinner';

interface SignupProps {
    onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (!firstName || !lastName || !mobile || !email || !password) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }
        
        setLoading(true);

        try {
            // The sign-up process now only handles authentication.
            // A database trigger in Supabase is expected to automatically create
            // a corresponding row in the public.profiles table.
            // The 'data' option is used to store metadata that the trigger can use.
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        mobile: mobile,
                    }
                }
            });

            if (signUpError) throw signUpError;
            
            setSuccessMessage('ثبت‌نام موفق بود! لطفاً ایمیل خود را برای دریافت لینک فعال‌سازی بررسی کنید (پوشه اسپم را نیز چک کنید).');

        } catch (err: any) {
            console.error('Signup Error:', err.message);
            if (err.message.includes('User already registered')) {
                setError('کاربری با این ایمیل قبلاً ثبت‌نام کرده است.');
            } else if (err.message.includes('Password should be at least 6 characters')) {
                setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            } else if (err.message.includes('Unable to validate email address')) {
                setError('فرمت ایمیل وارد شده نامعتبر است.');
            } else {
                setError('خطایی در فرآیند ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (successMessage) {
        return (
            <div className="animate-fade-in text-center">
                 <h2 className="text-2xl font-semibold text-slate-800 mb-4">ثبت‌نام کامل شد!</h2>
                 <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{successMessage}</p>
                 <p className="text-center text-sm text-slate-600 mt-6">
                    پس از فعال‌سازی حساب، می‌توانید{' '}
                    <button onClick={onSwitchToLogin} className="font-semibold text-indigo-600 hover:underline">
                        وارد شوید
                    </button>
                </p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">ایجاد حساب کاربری</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

                <div className="flex gap-3">
                    <div className="relative w-1/2">
                        <UserIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="نام" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light" required />
                    </div>
                     <div className="relative w-1/2">
                         <UserIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="نام خانوادگی" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light" required />
                    </div>
                </div>
                
                <div className="relative">
                    <PhoneIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input type="tel" placeholder="شماره موبایل" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light" required />
                </div>
                
                <div className="relative">
                    <MailIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input type="email" placeholder="ایمیل" value={email} onChange={e => setEmail(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light" required />
                </div>

                <div className="relative">
                    <LockIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input type="password" placeholder="رمز عبور" value={password} onChange={e => setPassword(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 placeholder:font-light" required />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[46px] flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {loading ? <Spinner /> : 'ثبت‌نام'}
                </button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-6">
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-indigo-600 hover:underline">
                    وارد شوید
                </button>
            </p>
        </div>
    );
};

export default Signup;
