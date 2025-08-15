// components/ui/UploadButton.jsx
import { useImageProcessor } from "../Helper/ImageCropper";

export function UploadButton({ onFileChange, maxKB = 5120, min = 300, max = 1000, requireSquare = true, onInvalid }) {
    const handleImageProcessed = (processedFile) => {
      onFileChange(processedFile);
    };

    const handleImageError = (errorMessage) => {
      onInvalid?.(errorMessage);
    };

    const { handleImageChange } = useImageProcessor(handleImageProcessed, handleImageError);
  
    return (
      <label className="cursor-pointer inline-block px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg hover:bg-neutral-700 transition">
        Upload Image
        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
      </label>
    );
  }
  