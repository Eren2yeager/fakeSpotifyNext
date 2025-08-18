import React, { memo } from 'react';
import { useOtherContexts } from '@/Contexts/otherContexts';
import { Dialog } from '../ui/Dialog';
import { motion, AnimatePresence } from 'framer-motion';

const ImagePreviewer = () => {
  const { imagefullViewSrc, setImagefullViewSrc } = useOtherContexts();

  return (

      <AnimatePresence>
        {imagefullViewSrc && (
          <motion.div
            className="fixed inset-0 z-50 backdrop-blur-xl bg-opacity-80 flex items-center justify-center overflow-auto max-w-screen max-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative  flex flex-col"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <img
                src={imagefullViewSrc}
                alt="Full View"
                className="max-w-[70vw]  sm:max-w-[800px] sm:max-h-[800px] object-cover shadow-2xl shadow-zinc-950"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.05 }}
              />
              <button
                onClick={() => setImagefullViewSrc(null)}
                className="font-bold text-xl p-1 px-4 rounded-full mt-5 shadow-2xl shadow-black font-snas self-center text-white opacity-100 bg-white/5 hover:bg-red-500 cursor-pointer transition"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.1 }}
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

  );
};

export default memo(ImagePreviewer);
