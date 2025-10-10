
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, CameraIcon } from './icons';
import CameraCapture from './CameraCapture';
import { resizeImageFromFile, resizeImageFromDataUrl } from '../services/imageUtils';


interface ImageInputProps {
    label: string;
    onImageSet: (base64: string, preview: string) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ label, onImageSet }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        try {
            const { base64, preview } = await resizeImageFromFile(file);
            setPreview(preview);
            setShowCamera(false);
            onImageSet(base64, preview);
        } catch (err) {
            console.error("Image resizing failed in ImageInput:", err);
            // Optionally, set an error state here to inform the user
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleCapture = async (dataUrl: string) => {
        try {
            const { base64, preview } = await resizeImageFromDataUrl(dataUrl);
            setPreview(preview);
            setShowCamera(false);
            onImageSet(base64, preview);
        } catch (err) {
            console.error("Captured image resizing failed in ImageInput:", err);
             // Optionally, set an error state here
        }
    };

    const handleReset = () => {
        setPreview(null);
        setShowCamera(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragEvent = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvent(e, false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    }, [handleFile, handleDragEvent]);

    if (showCamera) {
        return (
            <div className="bg-slate-100/50 p-4 rounded-xl">
                 <h3 className="text-lg font-bold text-center mb-4">{label}</h3>
                <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
            </div>
        )
    }

    if (preview) {
        return (
             <div className="bg-slate-100/50 p-4 rounded-xl text-center">
                 <h3 className="text-lg font-bold text-center mb-4">{label}</h3>
                 <img src={preview} alt="Preview" className="w-full h-48 object-cover mx-auto rounded-lg shadow-lg mb-4"/>
                 <button onClick={handleReset} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors duration-200">
                    تغییر عکس
                 </button>
            </div>
        )
    }

    return (
        <div className="bg-slate-100/50 p-4 rounded-xl flex flex-col h-full">
            <h3 className="text-lg font-bold text-center mb-4">{label}</h3>
            <div 
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                className={`flex-grow flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-100' : 'border-slate-300 hover:border-indigo-500'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                <UploadIcon className="w-10 h-10 text-slate-500 mb-3" />
                <p className="text-sm font-medium text-slate-600 text-center">بکشید یا انتخاب کنید</p>
            </div>
             <div className="my-4 flex items-center w-full">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-2 text-slate-500 text-xs">یا</span>
                <div className="flex-grow border-t border-slate-300"></div>
            </div>
            <button
                onClick={() => setShowCamera(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors"
            >
                <CameraIcon className="w-5 h-5 ml-2" />
                استفاده از دوربین
            </button>
        </div>
    );
};

export default ImageInput;
