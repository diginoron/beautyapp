
import React, { useState, useEffect } from 'react';
import { getAnalysisHistory } from '../services/historyService';
import type { HistoryItem, AnalysisResult, User } from '../types';
import Spinner from './Spinner';
import AnalysisDisplay from './AnalysisDisplay';
import { HistoryIcon } from './icons';

interface HistoryFlowProps {
    onBack: () => void;
    currentUser: User;
}

const HistoryCard: React.FC<{ item: HistoryItem; onClick: () => void; }> = ({ item, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center p-4 bg-slate-100/50 border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.02] text-right"
        >
            <img src={item.image_url} alt="Analyzed face" className="w-20 h-20 object-cover rounded-lg shadow-md ml-4" />
            <div className="flex-grow">
                <p className="font-semibold text-slate-800">امتیاز هماهنگی: {item.harmony_score}/10</p>
                <p className="text-sm text-slate-500 font-light">
                    {new Date(item.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>
        </button>
    );
};

const HistoryFlow: React.FC<HistoryFlowProps> = ({ onBack, currentUser }) => {
    const [history, setHistory] = useState<HistoryItem[] | null>(null);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser.id) return;
            setIsLoading(true);
            try {
                // The actual user ID is now passed from App.tsx
                const userHistory = await getAnalysisHistory(currentUser.id);
                setHistory(userHistory);
            } catch (err) {
                console.error("Failed to load history:", err);
                setError("خطا در بارگذاری سابقه. لطفاً دوباره تلاش کنید.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser.id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-indigo-500 animate-pulse">در حال بارگذاری سابقه شما...</p>
            </div>
        );
    }
    
    if (selectedItem) {
        const analysisResult: AnalysisResult = {
            isValidFace: true,
            harmonyScore: selectedItem.harmony_score,
            featureAnalysis: selectedItem.feature_analysis,
            suggestions: selectedItem.suggestions,
        };
        return (
            <AnalysisDisplay 
                result={analysisResult} 
                imagePreview={selectedItem.image_url} 
                onBack={() => setSelectedItem(null)} 
            />
        )
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-800">سابقه تحلیل‌ها</h2>
                <p className="text-slate-500 mt-2 font-light">نتایج تحلیل‌های گذشته خود را مشاهده کنید.</p>
            </div>

            {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            {history && history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map(item => (
                        <HistoryCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-slate-100 rounded-xl">
                    <HistoryIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">هنوز سابقه‌ای وجود ندارد</h3>
                    <p className="text-slate-500 mt-2">وقتی یک تحلیل چهره انجام دهید، نتیجه آن اینجا نمایش داده می‌شود.</p>
                </div>
            )}

            <div className="text-center pt-6 border-t border-slate-200">
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                >
                    بازگشت به خانه
                </button>
            </div>
        </div>
    );
};

export default HistoryFlow;
