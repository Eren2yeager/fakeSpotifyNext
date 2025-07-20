

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
