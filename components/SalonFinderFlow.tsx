import React, { useState, useCallback } from 'react';
import { callAvalAIProxy } from '../services/avalaiProxyService'; // Use new proxy service
import type { Salon, User } from '../types';
import { checkUserStatus, deductTokens, incrementUsageCount } from '../services/profileService';
import Spinner from './Spinner';
import { GpsIcon, MapPinIcon } from './icons';

interface SalonFinderFlowProps {
    currentUser: User;
    onBack: () => void;
    onTokensUsed: (count: number) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex" aria-label={`امتیاز: ${rating} از 5`}>
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            ))}
            {halfStar && (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" clipPath="url(#clip-half)" /><defs><clipPath id="clip-half"><path d="M0 0h10v20H0z" /></clipPath></defs></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                 <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            ))}
            <span className="text-sm text-slate-600 mr-2">{rating.toFixed(1)}</span>
        </div>
    );
};

const SalonCard: React.FC<{ salon: Salon }> = ({ salon }) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 transform transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-pink-600 mb-2">{salon.name}</h3>
            <StarRating rating={salon.rating} />
        </div>
        <p className="text-sm text-slate-500 mb-3 font-light">{salon.address}</p>
        <p className="text-sm font-semibold text-slate-800">{salon.phone}</p>
    </div>
);


const SalonFinderFlow: React.FC<SalonFinderFlowProps> = ({ currentUser, onBack, onTokensUsed }) => {
    const [view, setView] = useState<'input' | 'loading' | 'results'>('input');
    const [salons, setSalons] = useState<Salon[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');

    const findSalons = useCallback(async (locationQuery: string) => {
        setLoadingMessage('در حال جستجو برای بهترین سالن‌ها...');
        setView('loading');
        setError(null);
        setSalons(null);
        try {
            const status = await checkUserStatus(currentUser.id);
            if (!status.canProceed) {
                setError(status.message);
                setView('input');
                return;
            }

            // FIX: Removed redundant `.data` access. `results` directly holds `Salon[]`.
            const { data: results, totalTokens } = await callAvalAIProxy<{ data: Salon[]; totalTokens: number }>('findNearbySalons', { locationQuery });
            onTokensUsed(totalTokens);
            await deductTokens(currentUser.id, totalTokens);
            await incrementUsageCount(currentUser.id);


            // FIX: Removed redundant `.data` access. `results` directly holds `Salon[]`.
            if (results && results.length > 0) {
                setSalons(results);
                setView('results');
            } else {
                setError('متاسفانه سالنی در این منطقه یافت نشد. لطفاً منطقه دیگری را امتحان کنید.');
                setView('input');
            }
        } catch (err) {
            console.error("Salon finder error:", String(err));
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('خطایی در ارتباط با سرویس رخ داد. لطفاً دوباره تلاش کنید.');
            }
            setView('input');
        }
    }, [onTokensUsed, currentUser.id]);

    const handleGpsSearch = () => {
        if (!navigator.geolocation) {
            setError('مرورگر شما از موقعیت‌یابی جغرافیایی پشتیبانی نمی‌کند.');
            return;
        }
        setLoadingMessage('در حال دریافت موقعیت مکانی شما...');
        setView('loading');
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                findSalons(`نزدیک به مختصات ${latitude}, ${longitude}`);
            },
            () => {
                setError('دسترسی به موقعیت مکانی شما ممکن نیست. لطفاً آن را در تنظیمات مرورگر فعال کنید و دوباره تلاش کنید.');
                setView('input');
            }
        );
    };

    const handleManualSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const location = formData.get('location') as string;
        if (location && location.trim()) {
            findSalons(location.trim());
        } else {
            setError('لطفاً نام شهر یا منطقه را وارد کنید.');
        }
    };

    const handleReset = () => {
        setView('input');
        setSalons(null);
        setError(null);
    };

    if (view === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-pink-500 animate-pulse font-medium">{loadingMessage}</p>
            </div>
        );
    }
    
    if (view === 'results' && salons) {
        return (
            <div className="animate-fade-in space-y-6">
                 <h2 className="text-3xl font-extrabold text-center text-slate-800">برترین سالن‌های زیبایی</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {salons.map((salon, index) => (
                        <SalonCard key={index} salon={salon} />
                    ))}
                 </div>
                 <div className="text-center pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                    >
                        بازگشت به خانه
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                    >
                        جستجوی جدید
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">بهترین سالن‌های زیبایی را پیدا کنید</h2>
            {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            <div className="space-y-4 max-w-sm mx-auto">
                <button
                    onClick={handleGpsSearch}
                    className="w-full flex items-center justify-center px-6 py-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105"
                >
                    <GpsIcon className="w-6 h-6 ml-3" />
                    استفاده از موقعیت فعلی من
                </button>
                <div className="my-4 flex items-center w-full">
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">یا</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                </div>
                <form onSubmit={handleManualSearch} className="space-y-4">
                     <input
                        type="text"
                        name="location"
                        placeholder="مثلاً: تهران، سعادت آباد"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:font-light"
                        aria-label="مکان را به صورت دستی وارد کنید"
                     />
                     <button
                        type="submit"
                        className="w-full px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                    >
                        جستجو
                    </button>
                </form>
            </div>
             <div className="mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold rounded-lg transition-all"
                >
                    بازگشت
                </button>
            </div>
        </div>
    );
};

export default SalonFinderFlow;