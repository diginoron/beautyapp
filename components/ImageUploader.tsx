import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, CameraIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    onUseCamera: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onUseCamera }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
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
            onImageUpload(file);
        }
    }, [onImageUpload, handleDragEvent]);


    return (
        <div className="flex flex-col items-center justify-center p-10 md:p-16">
             <div 
                onClick={handleClick}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-100 scale-105' : 'border-slate-400 hover:border-indigo-500 hover:bg-slate-100'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                <UploadIcon className="w-12 h-12 text-slate-500 mb-4 transition-colors duration-300" />
                <p className="text-lg font-medium text-slate-700">تصویر خود را اینجا بکشید یا برای انتخاب کلیک کنید</p>
                <p className="text-xs text-slate-500 mt-2 font-light">(PNG, JPG, WEBP)</p>
            </div>
            
            <div className="my-6 flex items-center w-full max-w-xs">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-slate-500">یا</span>
                <div className="flex-grow border-t border-slate-300"></div>
            </div>

            <button
                onClick={onUseCamera}
                className="w-full max-w-xs flex items-center justify-center px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105"
            >
                <CameraIcon className="w-6 h-6 ml-3" />
                استفاده از دوربین
            </button>
        </div>
    );
};

export default ImageUploader;