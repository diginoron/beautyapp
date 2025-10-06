import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
    onCapture: (dataUrl: string) => void;
    onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const newStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Camera access error:", String(err));
            setError("دسترسی به دوربین ممکن نیست. لطفاً آن را در تنظیمات مرورگر خود فعال کنید.");
        }
    }, [stream]);
    
    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
        const canvas = document.createElement('canvas');
        if (videoRef.current) {
            // Set canvas dimensions to match the video to avoid stretching
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                // Flip the context horizontally for a mirror effect
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onCapture(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
            {error ? (
                <div className="text-center p-4 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-semibold">{error}</p>
                     <button
                        onClick={startCamera}
                        className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        دوباره تلاش کنید
                    </button>
                </div>
            ) : (
                <div className="relative w-full max-w-lg mx-auto">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto rounded-lg shadow-lg bg-black transform scale-x-[-1]"
                    />
                    <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
                </div>
            )}
            <div className="mt-6 flex items-center justify-center space-x-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300"
                    aria-label="Cancel"
                >
                    لغو
                </button>
                <button
                    onClick={handleCapture}
                    disabled={!!error}
                    className="w-20 h-20 rounded-full bg-white p-1.5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-white disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    aria-label="Take Photo"
                >
                    <span className="w-full h-full rounded-full bg-indigo-600 border-2 border-white hover:bg-indigo-700"></span>
                </button>
            </div>
        </div>
    );
};

export default CameraCapture;