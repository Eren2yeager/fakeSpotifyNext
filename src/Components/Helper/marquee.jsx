import React, { useEffect, useRef, useState } from "react";

 function Marquee(props) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const animationRef = useRef(null);
  const [canAnimate, setCanAnimate] = useState(false);

  const SPEED_PX_PER_SEC = 5;

  const runAnimation = () => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const containerWidth = container.offsetWidth;
    const textWidth = textEl.scrollWidth;
    const distance = textWidth - containerWidth;

    if (distance <= 0) {
      setCanAnimate(false);
      textEl.style.transform = "translateX(0)";
      animationRef.current?.cancel();
      return;
    }

    setCanAnimate(true);

    const singleScrollDuration = (distance / SPEED_PX_PER_SEC) * 1000;
    const totalDuration = singleScrollDuration * 2 + 2000;

    const keyframes = [
      { transform: "translateX(0)" },
      { transform: `translateX(-${distance}px)` },
      { transform: "translateX(0)" },
    ];

    const timing = {
      duration: totalDuration,
      iterations: Infinity,
      easing: "linear",
    };

    animationRef.current?.cancel();
    animationRef.current = textEl.animate(keyframes, timing);
  };

  useEffect(() => {
    runAnimation();

    const observer = new ResizeObserver(() => {
      runAnimation();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      animationRef.current?.cancel();
    };
  }, [props.text]);

  const handleMouseEnter = () => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden whitespace-nowrap w-[100%]  text-white  ${props.className}  `}
      style={{
        // Only apply mask when animating (i.e., when overflow happens)
        maskImage: canAnimate
          ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
          : "none",
        WebkitMaskImage: canAnimate
          ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
          : "none",
      }}
    >
      <div
        ref={textRef}
        className={`inline-block px-1 font-sans ${props.textClassName}`}
        style={{
          willChange: "transform",
          whiteSpace: "nowrap",
        }}
        onClick={props.onClick}
      >
        {props.text}
      </div>
    </div>
  );
}


export default React.memo(Marquee);