import React from 'react';
import { FaceIcon, MenuIcon, TokenIcon, UserCheckIcon } from './icons';

interface HeaderProps {
    onMenuToggle: () => void;
    totalTokensUsed: number;
    currentUsage: number;
    usageLimit: number;
    tokenBalance: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, totalTokensUsed, currentUsage, usageLimit, tokenBalance }) => {
    return (
        <header className="relative py-4 px-6 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-lg z-30">
            <div className="container mx-auto flex items-center justify-between">
                {/* Menu Button on the right (start for RTL) */}
                <div className="flex-1 flex justify-start">
                    <button onClick={onMenuToggle} className="p-2 rounded-md text-slate-600 hover:bg-slate-200" aria-label="Open menu">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>
                {/* Centered Title */}
                <div className="flex items-center justify-center">
                    <FaceIcon className="w-8 h-8 text-indigo-500 ml-3" />
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-800">تحلیلگر زیبایی چهره</h1>
                </div>
                {/* Counters on the left (end for RTL) */}
                <div className="flex-1 flex justify-end items-center gap-2">
                     <div className="flex items-center space-x-2-reverse space-x-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full" title="مصرف روزانه">
                        <UserCheckIcon className="w-5 h-5 text-teal-500" />
                        <span className="font-semibold">{usageLimit - currentUsage < 0 ? 0 : usageLimit - currentUsage}</span>
                        <span className="font-light">باقیمانده</span>
                    </div>
                     <div className="hidden sm:flex items-center space-x-2-reverse space-x-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full" title="توکن باقی‌مانده">
                        <TokenIcon className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">{tokenBalance.toLocaleString('fa-IR')}</span>
                        <span className="font-light">توکن</span>
                    </div>
                     <div className="hidden lg:flex items-center space-x-2-reverse space-x-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full" title="توکن‌های مصرفی (این جلسه)">
                        <TokenIcon className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold">{totalTokensUsed.toLocaleString('fa-IR')}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
