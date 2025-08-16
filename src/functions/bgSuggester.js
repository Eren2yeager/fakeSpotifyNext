
/**
 * Suggest a light, vibrant background color based on the dominant hue of the image.
 * If the image is dark blue or has a blue context, returns a sky blue color.
 * For other dominant colors, returns a light pastel version of that color.
 */

const SuggestBgColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];

        const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;

        // Only consider dark pixels
        if (brightness < 100) {
          r += red;
          g += green;
          b += blue;
          count++;
        }
      }

      if (count === 0) {
        return resolve("#18181b"); // Tailwind zinc-900 fallback
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const isTotallyBlack = r < 5 && g < 5 && b < 5;
      if (isTotallyBlack) {
        return resolve("#18181b"); // force zinc-900 if fully black
      }

      const toHex = (c) => c.toString(16).padStart(2, '0');
      const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

      resolve(hexColor);
    };

    img.onerror = (err) => reject(err);
  });
};

export default SuggestBgColor;




const SuggestLihtestBgColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

      let r = 0, g = 0, b = 0, count = 0;

      // Sample every 10th pixel for performance
      for (let i = 0; i < imageData.length; i += 40) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];

        r += red;
        g += green;
        b += blue;
        count++;
      }

      if (count === 0) {
        return resolve("#a5b4fc"); // fallback: mid-light blue (Tailwind indigo-300)
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Convert to HSL to determine dominant hue
      function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return [h * 360, s, l];
      }

      const [hue, sat, light] = rgbToHsl(r, g, b);

      // Instead of very light colors, use mid-light Tailwind colors that won't blend with white text
      if (hue >= 180 && hue <= 260) {
        return resolve("#60a5fa"); // Tailwind sky-400 (mid blue)
      }
      if (hue >= 80 && hue < 170) {
        return resolve("#34d399"); // Tailwind green-400 (mid green)
      }
      if ((hue >= 330 && hue <= 360) || (hue >= 0 && hue < 20)) {
        return resolve("#f87171"); // Tailwind red-400 (mid red/pink)
      }
      if (hue >= 20 && hue < 60) {
        return resolve("#fbbf24"); // Tailwind yellow-400 (mid yellow)
      }
      if (hue >= 260 && hue < 320) {
        return resolve("#a78bfa"); // Tailwind purple-400 (mid purple)
      }
      // Otherwise, return a mid-light gray as fallback (not too white)
      return resolve("#d1d5db"); // Tailwind gray-300
    };

    img.onerror = (err) => reject(err);
  });
};

export { SuggestLihtestBgColor };