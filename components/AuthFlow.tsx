import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import { FaceIcon } from './icons';

type AuthView = 'login' | 'signup' | 'forgotPassword';

const AuthFlow: React.FC = () => {
    const [view, setView] = useState<AuthView>('login');

    const renderView = () => {
        switch (view) {
            case 'signup':
                return <Signup onSwitchToLogin={() => setView('login')} />;
            case 'forgotPassword':
                return <ForgotPassword onSwitchToLogin={() => setView('login')} />;
            case 'login':
            default:
                return <Login onSwitchToSignup={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgotPassword')} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <FaceIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">تحلیلگر زیبایی چهره</h1>
                     <p className="text-slate-500 mt-2 font-light">برای ادامه وارد شوید یا ثبت‌نام کنید.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    {renderView()}
                </div>
            </div>
        </div>
    );
};

export default AuthFlow;
