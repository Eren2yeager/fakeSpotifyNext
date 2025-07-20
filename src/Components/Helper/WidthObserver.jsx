import { useEffect, useRef } from "react";

/**
 * @param {(w: number) => void} onWidthChange - A function that receives width updates
 * @returns {React.RefObject} ref - Attach this to the element you want to observe
 */
export function useWidthObserver(onWidthChange) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          onWidthChange(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [onWidthChange]);

  return ref;
}
