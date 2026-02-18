import { PixelCrop } from "react-image-crop";

export function loadImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = src;
  });
}

export function getCroppedImage(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<string> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
      },
      "image/png",
      1
    );
  });
}

export function matchBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = data.data;

      const samples: number[][] = [];
      const w = canvas.width;
      const h = canvas.height;
      const margin = Math.max(Math.floor(Math.min(w, h) * 0.03), 2);

      for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 40))) {
        for (let row = 0; row < margin; row++) {
          const iTop = (row * w + x) * 4;
          const iBot = ((h - 1 - row) * w + x) * 4;
          samples.push([pixels[iTop], pixels[iTop + 1], pixels[iTop + 2]]);
          samples.push([pixels[iBot], pixels[iBot + 1], pixels[iBot + 2]]);
        }
      }
      for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 40))) {
        for (let col = 0; col < margin; col++) {
          const iLeft = (y * w + col) * 4;
          const iRight = (y * w + (w - 1 - col)) * 4;
          samples.push([pixels[iLeft], pixels[iLeft + 1], pixels[iLeft + 2]]);
          samples.push(
            [pixels[iRight], pixels[iRight + 1], pixels[iRight + 2]]
          );
        }
      }

      const sorted = (ch: number) =>
        samples.map((s) => s[ch]).sort((a, b) => a - b);
      const mid = Math.floor(samples.length / 2);
      const bgR = sorted(0)[mid];
      const bgG = sorted(1)[mid];
      const bgB = sorted(2)[mid];

      const scaleR = bgR > 20 ? 255 / bgR : 1;
      const scaleG = bgG > 20 ? 255 / bgG : 1;
      const scaleB = bgB > 20 ? 255 / bgB : 1;

      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.min(255, Math.round(pixels[i] * scaleR));
        pixels[i + 1] = Math.min(255, Math.round(pixels[i + 1] * scaleG));
        pixels[i + 2] = Math.min(255, Math.round(pixels[i + 2] * scaleB));
      }

      ctx.putImageData(data, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
        },
        "image/png",
        1
      );
    };
    img.src = imageSrc;
  });
}
