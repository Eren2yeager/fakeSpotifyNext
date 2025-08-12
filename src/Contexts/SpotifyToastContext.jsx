"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";

/* ------------------------------
  Context & Hook
------------------------------ */
const ToastContext = createContext();

export const useSpotifyToast = () => useContext(ToastContext);

/* ------------------------------
  Provider Component
------------------------------ */
export function SpotifyToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ text, image = null, duration = 3000 }) => {
    const id = nanoid();
    setToasts((prev) => [...prev, { id, text, image }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {createPortal(
        <div className="fixed bottom-1/4 left-1/2 -translate-x-1/2 z-[1100000] space-y-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map(({ id, text, image }) => (
              <motion.div 
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white text-black text-sm font-medium rounded-lg shadow-lg px-4 py-2 flex items-center gap-3 
                max-w-sm sm:max-w-sm w-[90vw] sm:w-auto mx-auto"
            >
                {image && (
                  <img
                    src={image}
                    alt="toast"
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <span className="whitespace-nowrap w-full truncate">{text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
