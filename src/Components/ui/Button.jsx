// components/ui/Button.jsx
export function Button({ children, className = "", ...props }) {
    return (
      <button
        {...props}
        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all ${className}`}
      >
        {children}
      </button>
    );
  }
  