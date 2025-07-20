import React, { useState ,useContext ,memo } from 'react';
import { imagePreviewContext } from '../../Contexts/contexts';

const ImagePreviewer = () => {
  
  const ContextSelectedImage = useContext(imagePreviewContext)
  

  return (
    <div>
      {/* Fullscreen Modal */}
      {ContextSelectedImage?.src && (
        <div className=" fixed inset-0 z-50 backdrop-blur-xl bg-opacity-80 flex items-center justify-center overflow-auto max-w-screen max-h-screen">
        <div className="relative   max-w-[75%] min-h-[75%] flex flex-col">
            <img
              src={ContextSelectedImage.src}
              alt="Full View"
              className="max-w-[100%] max-h-[100%] object-cover shadow-2xl shadow-zinc-950"
            />
            <button
              onClick={() => {(ContextSelectedImage.setSrc(null))}}
              className=" font-bold text-xl p-1 px-4 rounded-full mt-5  shadow-2xl shadow-black  font-snas  self-center text-white opacity-100 bg-white/5 hover:bg-red-500 cursor-pointer transition"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ImagePreviewer);
