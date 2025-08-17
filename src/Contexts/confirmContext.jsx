'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const [resolver, setResolver] = useState(() => {});

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result) => {
    setOptions(null);
    resolver(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {options && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              key="dialog"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="bg-white rounded-xl m-5 p-6 w-[420px]  shadow-2xl"
            >
              {/* Title */}
              <h2 className="text-xl font-bold text-black mb-3">
                {options.title || 'Are you sure?'}
              </h2>

              {/* Description */}
              <p className="text-black text-sm mb-6">{options.text}</p>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleClose(false)}
                  className="px-6 py-2 rounded-full  font-bold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className="px-6 py-2 rounded-full bg-green-500 border border-gray-300 text-white font-bold hover:bg-green-400 transition"
                >
                  {options.confirmText || 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
