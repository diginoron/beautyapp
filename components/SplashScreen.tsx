import React from 'react';

interface SplashScreenProps {
    onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
    // آدرس تصویر پس‌زمینه با یک تصویر زیباتر جایگزین شد
    const backgroundImageUrl = 'https://images.pexels.com/photos/247204/pexels-photo-247204.jpeg';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white animate-fade-in relative overflow-hidden">
            {/* Background Image Layer using <img> tag for reliability */}
            <img
                src={backgroundImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                aria-hidden="true"
            />

            {/* Overlay Layer */}
            <div className="absolute inset-0 w-full h-full bg-black/50" aria-hidden="true"></div>

            {/* Content Layer */}
            <div className="relative z-10 text-center p-8 animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-shadow">
                    تحلیلگر زیبایی چهره
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto text-shadow-sm font-light">
                    با قدرت هوش مصنوعی، ابعاد جدیدی از زیبایی خود را کشف کنید.
                </p>
                <button
                    onClick={onEnter}
                    className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg text-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                >
                    ورود به برنامه
                </button>
            </div>
        </div>
    );
};

export default SplashScreen;