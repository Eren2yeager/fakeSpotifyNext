// components/ui/Dialog.jsx
import { AnimatePresence, motion } from "framer-motion";
import React,{useEffect} from "react";
export function Dialog({ open, onClose, children }) {


  useEffect(() => {
    if(open){
      document.body.style.overflow = "hidden";
    }else {
      document.body.style.overflow = "";
    }
  

  }, [])
  




  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm  z-10000" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog content */}
          <motion.div
            className="fixed top-1/2 left-1/2  w-full max-w-xl overflow-auto max-h-screen -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-neutral-900 p-6 shadow-lg z-10001"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
