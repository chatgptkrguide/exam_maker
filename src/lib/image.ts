import { PixelCrop } from "react-image-crop";

const MAX_PROCESS_SIZE = 2000;

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
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

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

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error("Blob creation failed"));
        }
      },
      "image/png",
      1
    );
  });
}

function downscaleIfNeeded(
  img: HTMLImageElement
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  if (w <= MAX_PROCESS_SIZE && h <= MAX_PROCESS_SIZE) {
    canvas.width = w;
    canvas.height = h;
  } else {
    const ratio = Math.min(MAX_PROCESS_SIZE / w, MAX_PROCESS_SIZE / h);
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
  }

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

export function matchBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const { canvas, ctx } = downscaleIfNeeded(img);
        const w = canvas.width;
        const h = canvas.height;
        const data = ctx.getImageData(0, 0, w, h);
        const pixels = data.data;

        const margin = Math.max(Math.floor(Math.min(w, h) * 0.03), 2);
        const stepX = Math.max(1, Math.floor(w / 40));
        const stepY = Math.max(1, Math.floor(h / 40));

        const rSamples: number[] = [];
        const gSamples: number[] = [];
        const bSamples: number[] = [];

        const addSample = (idx: number) => {
          rSamples.push(pixels[idx]);
          gSamples.push(pixels[idx + 1]);
          bSamples.push(pixels[idx + 2]);
        };

        for (let x = 0; x < w; x += stepX) {
          for (let row = 0; row < margin; row++) {
            addSample((row * w + x) * 4);
            addSample(((h - 1 - row) * w + x) * 4);
          }
        }
        for (let y = 0; y < h; y += stepY) {
          for (let col = 0; col < margin; col++) {
            addSample((y * w + col) * 4);
            addSample((y * w + (w - 1 - col)) * 4);
          }
        }

        const median = (arr: number[]) => {
          arr.sort((a, b) => a - b);
          return arr[Math.floor(arr.length / 2)];
        };

        const bgR = median(rSamples);
        const bgG = median(gSamples);
        const bgB = median(bSamples);

        const threshold = 20;
        const scaleR = bgR > threshold ? 255 / bgR : 1;
        const scaleG = bgG > threshold ? 255 / bgG : 1;
        const scaleB = bgB > threshold ? 255 / bgB : 1;

        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = Math.min(255, (pixels[i] * scaleR + 0.5) | 0);
          pixels[i + 1] = Math.min(255, (pixels[i + 1] * scaleG + 0.5) | 0);
          pixels[i + 2] = Math.min(255, (pixels[i + 2] * scaleB + 0.5) | 0);
        }

        ctx.putImageData(data, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              resolve(imageSrc);
            }
          },
          "image/png",
          1
        );
      } catch {
        resolve(imageSrc);
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageSrc;
  });
}
