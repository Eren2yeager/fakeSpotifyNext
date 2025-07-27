// components/ui/Textarea.jsx
export function Textarea(props) {
    return (
      <textarea
        {...props}
        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
    );
  }
  