import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import CameraCapture from './components/CameraCapture';
import AnalysisDisplay from './components/AnalysisDisplay';
import Spinner from './components/Spinner';
import ModeSelector from './components/ModeSelector';
import ComparisonFlow from './components/ComparisonFlow';
import MorphFlow from './components/MorphFlow';
import ColorHarmonyFlow from './components/ColorHarmonyFlow';
import SalonFinderFlow from './components/SalonFinderFlow';
import Menu from './components/Menu';
import SplashScreen from './components/SplashScreen';
import { resizeImageFromFile, resizeImageFromDataUrl } from './services/imageUtils';


const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState<boolean>(true);
    const [mode, setMode] = useState<'initial' | 'single' | 'compare' | 'morph' | 'color' | 'salonFinder'>('initial');
    
    // State for single analysis mode
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleImageUpload = async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const { base64, preview } = await resizeImageFromFile(file);
            setImageBase64(base64);
            setImagePreview(preview);
            setAnalysis(null);
        } catch (err) {
            console.error("Image resizing failed:", err);
            setError("خطا در پردازش تصویر. لطفاً یک تصویر دیگر را امتحان کنید.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapture = async (dataUrl: string) => {
        setIsLoading(true);
        setError(null);
        setShowCamera(false);
        try {
            const { base64, preview } = await resizeImageFromDataUrl(dataUrl);
            setImageBase64(base64);
            setImagePreview(preview);
            setAnalysis(null);
        } catch (err) {
            console.error("Captured image resizing failed:", err);
            setError("خطا در پردازش تصویر دوربین. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnalyzeClick = useCallback(async () => {
        if (!imageBase64) {
            setError('لطفاً ابتدا یک تصویر را انتخاب کنید.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeImage(imageBase64);
            if(result.isValidFace) {
                 setAnalysis(result);
            } else {
                setError(result.errorMessage || 'چهره‌ای در تصویر شناسایی نشد یا تصویر نامعتبر است.');
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            if (err instanceof Error) {
                setError(err.message); // Display the specific error message from the service
            } else {
                setError('خطایی ناشناخته در هنگام تحلیل تصویر رخ داد. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageBase64]);

    const handleReset = () => {
        setImageBase64(null);
        setImagePreview(null);
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
        setShowCamera(false);
        setMode('initial');
    };
    
    const handleSingleModeReset = () => {
        setImageBase64(null);
        setImagePreview(null);
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
        setShowCamera(false);
    }
    
    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    }
    
    if (showSplash) {
        return <SplashScreen onEnter={() => setShowSplash(false)} />;
    }

    return (
        <div className="min-h-screen flex flex-col font-sans animate-fade-in">
            <Header onMenuToggle={handleMenuToggle} />
            <Menu 
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onGoHome={handleReset}
            />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
                <div className="w-full max-w-4xl text-center">
                     <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400 tracking-tight">
                        خوش آمدید!
                    </h2>
                    <p className="text-slate-500 mb-8 text-lg font-light">
                       زیبایی خود را با هوش مصنوعی دیجی نورون کشف کنید
                    </p>
                </div>
                
                <div className="w-full max-w-4xl bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200">
                    {mode === 'initial' && <ModeSelector onSelectMode={setMode} />}
                    
                    {mode === 'single' && (
                        <>
                           {!imagePreview && !showCamera && !isLoading &&(
                                <ImageUploader onImageUpload={handleImageUpload} onUseCamera={() => setShowCamera(true)} />
                            )}
                            
                            {!imagePreview && showCamera && (
                                <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
                            )}

                            {imagePreview && !isLoading && !analysis && (
                                 <div className="text-center">
                                    <img src={imagePreview} alt="Preview" className="max-w-xs mx-auto rounded-lg shadow-lg mb-6"/>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={handleAnalyzeClick}
                                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                                        >
                                            تحلیل چهره
                                        </button>
                                         <button
                                            onClick={handleSingleModeReset}
                                            className="px-8 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300"
                                        >
                                            تغییر عکس
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center p-12">
                                    <Spinner />
                                    <p className="mt-4 text-lg font-medium text-indigo-500 animate-pulse">در حال تحلیل چهره... این ممکن است کمی طول بکشد.</p>

                                </div>
                            )}

                            {error && (
                                 <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg">
                                    <p className="text-red-700 font-semibold">{error}</p>
                                    <button
                                        onClick={handleSingleModeReset}
                                        className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        دوباره تلاش کنید
                                    </button>
                                </div>
                            )}

                            {analysis && (
                                <AnalysisDisplay result={analysis} imagePreview={imagePreview!} onReset={handleReset} />
                            )}
                        </>
                    )}

                    {mode === 'compare' && <ComparisonFlow onBack={handleReset} />}
                    {mode === 'morph' && <MorphFlow onBack={handleReset} />}
                    {mode === 'color' && <ColorHarmonyFlow onBack={handleReset} />}
                    {mode === 'salonFinder' && <SalonFinderFlow onBack={handleReset} />}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
