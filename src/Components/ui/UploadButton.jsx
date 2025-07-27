// components/ui/UploadButton.jsx
export function UploadButton({ onFileChange }) {
    const handleChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileChange(e.target.files[0]);
      }
    };
  
    return (
      <label className="cursor-pointer inline-block px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg hover:bg-neutral-700 transition">
        Upload Image
        <input type="file" accept="image/*" onChange={handleChange} hidden />
      </label>
    );
  }
  