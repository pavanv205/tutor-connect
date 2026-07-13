/**
 * Progressively compresses an image file to be under maxSizeBytes.
 * Supports JPEG, PNG, and WebP.
 * Converts PNG to JPEG if file size exceeds the target to allow compression.
 * 
 * @param {File} file - The uploaded image file.
 * @param {number} maxSizeBytes - Maximum size allowed in bytes (default 500 KB).
 * @returns {Promise<{file: File, previewUrl: string, originalSize: number, compressedSize: number}>}
 */
export const compressImage = (file, maxSizeBytes = 500 * 1024) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale resolution if extremely large to maintain performance (max 1200px)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Define output formats.
        // PNG is lossless and cannot be quality compressed. If it's too large, convert to image/jpeg.
        let outputMime = file.type;
        let outputName = file.name;
        if (file.type === 'image/png' && file.size > maxSizeBytes) {
          outputMime = 'image/jpeg';
          outputName = file.name.replace(/\.png$/i, '.jpg');
        }

        let quality = 0.9;
        const step = 0.08;

        const checkAndCompress = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas compression failed'));
                return;
              }

              // Resolve if target size met or minimum quality reached
              if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
                const compressedFile = new File([blob], outputName, {
                  type: blob.type || outputMime,
                  lastModified: Date.now()
                });
                
                resolve({
                  file: compressedFile,
                  previewUrl: URL.createObjectURL(blob),
                  originalSize: file.size,
                  compressedSize: compressedFile.size
                });
              } else {
                checkAndCompress(currentQuality - step);
              }
            },
            outputMime,
            currentQuality
          );
        };

        checkAndCompress(quality);
      };
      img.onerror = () => reject(new Error('Failed to load image element'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};
