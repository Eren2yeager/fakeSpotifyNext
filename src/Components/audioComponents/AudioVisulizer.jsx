import React, { useEffect, useRef, useState } from "react";

const AudioVisualizer = () => {
  const audioRef = useRef();
  const [bars, setBars] = useState(new Array(32).fill(0));
  const animationRef = useRef();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      setBars([...dataArray]);
      animationRef.current = requestAnimationFrame(draw);
    };
    
    {console.log(dataArray)}
    audio.onplay = () => {
      audioCtx.resume().then(() => {
        draw();
      });
    };

    return () => {
      cancelAnimationFrame(animationRef.current);
      analyser.disconnect();
      source.disconnect();
    };
  }, []);

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <audio
        ref={audioRef}
        src="https://eren2yeager.github.io/songs/audios/Legends%20Never%20Die%20(ft.%20Against%20The%20Current)%20%EF%BD%9C%20Worlds%202017%20-%20League%20of%20Legends%20(1).mp3"
        controls
        className="mb-4"
      />
      <div className="flex items-end h-32 gap-1 w-full max-w-xl">
        {bars.map((value, index) => (
          <div
            key={index}
            className="bg-green-400 w-1 rounded transition-all duration-75"
            style={{ height: `${(value / 255) * 100}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AudioVisualizer);
