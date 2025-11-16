import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '../types';
import { CloseIcon, CopyIcon, ClipboardCheckIcon, TwitterIcon, WhatsAppIcon } from './icons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: AnalysisResult;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result }) => {
    const [copied, setCopied] = useState(false);
    const APP_LINK = "https://beauty.diginoron.com/";

    const generateShareText = useCallback(() => {
        const features = result.featureAnalysis.slice(0, 2).map(f => f.feature).join('، ');
        return `من چهره‌ام رو با هوش مصنوعی تحلیل کردم و امتیاز هماهنگی ${result.harmonyScore}/10 گرفتم! 🌟 ویژگی‌های برجسته چهره من: ${features}. شما هم امتحان کنید! ${APP_LINK} #تحلیل_زیبایی_چهره`;
    }, [result]);
    
    const handleCopy = useCallback(() => {
        const textToCopy = generateShareText();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [generateShareText]);

    if (!isOpen) return null;

    const shareText = generateShareText();
    const encodedShareText = encodeURIComponent(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedShareText}`;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 w-full max-w-md m-4 relative transform transition-all duration-300 scale-95 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="بستن مودال"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    اشتراک‌گذاری نتایج
                </h3>
                <p className="text-slate-500 text-center mb-6 font-light">
                    نتایج تحلیل چهره با هوش مصنوعی را با دوستان خود به اشتراک بگذارید!
                </p>

                <div className="bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200 text-right">
                    <p className="text-slate-700 text-sm font-light">{shareText}</p>
                </div>

                <div className="space-y-3">
                     <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-all duration-200"
                    >
                        {copied ? (
                           <>
                            <ClipboardCheckIcon className="w-5 h-5 ml-2 text-green-400" />
                            در کلیپ‌بورد کپی شد!
                           </>
                        ) : (
                           <>
                             <CopyIcon className="w-5 h-5 ml-2" />
                            کپی کردن متن
                           </>
                        )}
                    </button>
                    <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center px-4 py-3 bg-[#1DA1F2] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-200"
                    >
                        <TwitterIcon className="w-5 h-5 ml-2" />
                        اشتراک‌گذاری در X (توییتر)
                    </a>
                     <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center px-4 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-200"
                    >
                        <WhatsAppIcon className="w-5 h-5 ml-2" />
                        اشتراک‌گذاری در واتس‌اپ
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;