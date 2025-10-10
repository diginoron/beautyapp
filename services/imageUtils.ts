
const MAX_IMAGE_SIZE = 1024; // Max width/height in pixels
const JPEG_QUALITY = 0.9;   // Compression quality

/**
 * Resizes an image from a File object to a maximum size.
 * @param file The image file.
 * @returns A promise that resolves with the resized image's base64 and data URL preview.
 */
export const resizeImageFromFile = (file: File): Promise<{ base64: string, preview: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }
            resizeImageFromDataUrl(event.target.result as string)
                .then(resolve)
                .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Resizes an image from a data URL string to a maximum size.
 * @param dataUrl The data URL of the image.
 * @returns A promise that resolves with the resized image's base64 and data URL preview.
 */
export const resizeImageFromDataUrl = (dataUrl: string): Promise<{ base64: string, preview: string }> => {
     return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > MAX_IMAGE_SIZE) {
                    height = Math.round(height * (MAX_IMAGE_SIZE / width));
                    width = MAX_IMAGE_SIZE;
                }
            } else {
                if (height > MAX_IMAGE_SIZE) {
                    width = Math.round(width * (MAX_IMAGE_SIZE / height));
                    height = MAX_IMAGE_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context for resizing.'));
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            const resizedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
            const base64 = resizedDataUrl.split(',')[1];
            
            resolve({ base64, preview: resizedDataUrl });
        };
        img.onerror = (err) => reject(new Error("Image failed to load for resizing."));
        img.src = dataUrl;
    });
}
