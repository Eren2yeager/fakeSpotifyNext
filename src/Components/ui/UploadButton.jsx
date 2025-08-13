// components/ui/UploadButton.jsx
export function UploadButton({ onFileChange, maxKB = 5120, min = 300, max = 1000, requireSquare = true, onInvalid }) {
    const handleChange = async (e) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      // size check (max only)
      const maxBytes = maxKB * 1024;
      if (file.size > maxBytes) {
        const label = maxKB >= 1024 ? `${maxKB / 1024}MB` : `${maxKB}KB`;
        onInvalid?.(`Image too large. Maximum size is ${label}`);
        e.target.value = "";
        return;
      }

      try {
        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;
        bitmap.close();

        if (requireSquare && width !== height) {
          onInvalid?.("Image must be square (e.g., 300x300)");
          e.target.value = "";
          return;
        }
        if (width < min) {
          onInvalid?.(`Image too small. Minimum is ${min}x${min}`);
          e.target.value = "";
          return;
        }
        if (width > max) {
          onInvalid?.(`Image too large. Maximum is ${max}x${max}`);
          e.target.value = "";
          return;
        }
      } catch (err) {
        onInvalid?.("Unable to read image. Please choose a valid image file");
        e.target.value = "";
        return;
      }

      onFileChange(file);
    };
  
    return (
      <label className="cursor-pointer inline-block px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg hover:bg-neutral-700 transition">
        Upload Image
        <input type="file" accept="image/*" onChange={handleChange} hidden />
      </label>
    );
  }
  