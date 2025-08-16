
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




const SuggestLightestBgColor = (imageUrl) => {
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
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      if (count === 0) {
        return resolve("#a5b4fc"); // fallback
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Convert RGB to HSL
      function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
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

      function hslToHex(h, s, l) {
        l = Math.max(0, Math.min(1, l));
        s = Math.max(0, Math.min(1, s));

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r, g, b;

        if (h < 60) [r, g, b] = [c, x, 0];
        else if (h < 120) [r, g, b] = [x, c, 0];
        else if (h < 180) [r, g, b] = [0, c, x];
        else if (h < 240) [r, g, b] = [0, x, c];
        else if (h < 300) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)}`;
      }

      let [h, s, l] = rgbToHsl(r, g, b);

      // Ensure saturation is at least 40% (avoid grayish colors)
      if (s < 0.4) s = 0.4;

      // Keep brightness in mid-light range for backgrounds
      if (l < 0.35) l = 0.45;
      if (l > 0.75) l = 0.65;

      const finalColor = hslToHex(h, s, l);
      resolve(finalColor);
    };

    img.onerror = (err) => reject(err);
  });
};

export { SuggestLightestBgColor };
