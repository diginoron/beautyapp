import React, { useState } from 'react';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from './icons';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!firstName || !lastName || !mobile || !email || !password) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        try {
            // Step 1: Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Step 2: Save additional user info in Firestore.
            // If this fails, the main App component will handle the missing profile data gracefully on login.
            setDoc(doc(db, "users", user.uid), {
                firstName,
                lastName,
                mobile,
                email,
            }).catch((firestoreError: any) => {
                // Log the error for debugging, but don't block the user flow.
                console.error("Non-critical error: Failed to create user document in Firestore during signup:", String(firestoreError));
            });
            
            setSuccess('ثبت‌نام با موفقیت انجام شد! به زودی وارد خواهید شد.');
            // onAuthStateChanged in App.tsx will handle the UI transition.

        } catch (err: any) {
            console.error('Signup Error:', { code: err.code, message: err.message });
            if (err.code === 'auth/email-already-in-use') {
                setError('کاربری با این ایمیل قبلاً ثبت‌نام کرده است.');
            } else if (err.code === 'auth/weak-password') {
                setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            } else {
                setError('خطایی در فرآیند ثبت‌نام رخ داد.');
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">ایجاد حساب کاربری</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                {success && <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-md">{success}</p>}

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
                    disabled={!!success}
                    className="w-full px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    ثبت‌نام
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