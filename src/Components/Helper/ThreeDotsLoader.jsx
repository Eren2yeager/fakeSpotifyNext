import React, { useEffect, useState } from 'react';

const ThreeDotsLoader = () => {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot(prev => (prev + 1) % 3);
    }, 200); // Change every 300ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full bg-gray-400 transition-transform duration-300 ${
            activeDot === i ? 'scale-150 opacity-100' : 'scale-100 opacity-60'
          }`}
        />
      ))}
    </div>
  );
};

export default ThreeDotsLoader;