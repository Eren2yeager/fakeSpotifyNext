"use client";

/**
 * Utility function to automatically crop and resize any image to 300x300 square
 * @param {File} file - The image file to process
 * @returns {Promise<File>} - Returns a new File object with the processed image
 */
export const cropAndResizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set canvas size to target dimensions
    canvas.width = 300;
    canvas.height = 300;
    
    img.onload = () => {
      try {
        // Calculate the crop dimensions to make it square
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        
        // Clear canvas and draw the cropped image
        ctx.clearRect(0, 0, 300, 300);
        ctx.drawImage(
          img,
          startX, startY, size, size,  // Source rectangle (crop)
          0, 0, 300, 300              // Destination rectangle (resize)
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file with the processed image
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/jpeg', 0.9); // Use JPEG format with 90% quality
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Hook for handling image upload with automatic cropping and resizing
 * @param {Function} onImageProcessed - Callback when image is processed
 * @param {Function} onError - Callback for errors
 * @returns {Object} - Object with handleImageChange function
 */
export const useImageProcessor = (onImageProcessed, onError) => {
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError(`Image too large. Maximum size is 5MB`);
      e.target.value = "";
      return;
    }
    
    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file');
      e.target.value = "";
      return;
    }
    
    try {
      // Process the image
      const processedFile = await cropAndResizeImage(file);
      onImageProcessed(processedFile);
    } catch (error) {
      onError('Failed to process image. Please try again.');
      e.target.value = "";
    }
  };
  
  return { handleImageChange };
};
