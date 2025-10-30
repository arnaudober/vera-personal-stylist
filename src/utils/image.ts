// Lightweight client-side image utilities: resize/compress and dominant color extraction
// Mobile-first: keep CPU usage low; synchronous canvas operations with small spinners in UI

export type ProcessedImage = {
  dataUrl: string; // resized/compressed data URL (webp if supported, else jpeg)
  width: number;
  height: number;
};

// Resize image to fit within maxSize (longest side), compress at given quality
export async function resizeAndCompress(file: File, maxSize = 1024, quality = 0.7): Promise<ProcessedImage> {
  const img = await fileToImage(file);

  const { canvas, targetW, targetH } = drawToCanvas(img, maxSize);

  const type = supportsWebP() ? 'image/webp' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(type, quality);
  return { dataUrl, width: targetW, height: targetH };
}

export async function extractDominantColor(dataUrl: string): Promise<string> {
  const img = await dataUrlToImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#CCCCCC';

  // downscale for speed
  const maxSample = 64;
  const ratio = Math.max(img.width, img.height) / maxSample || 1;
  const w = Math.max(1, Math.round(img.width / ratio));
  const h = Math.max(1, Math.round(img.height / ratio));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 16) continue; // skip near-transparent
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  if (count === 0) return '#CCCCCC';
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);
  return rgbToHex(r, g, b);
}

function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  try {
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function drawToCanvas(img: HTMLImageElement, maxSize: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  const ratio = Math.max(img.width, img.height) / maxSize;
  const targetW = ratio > 1 ? Math.round(img.width / ratio) : img.width;
  const targetH = ratio > 1 ? Math.round(img.height / ratio) : img.height;
  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return { canvas, targetW, targetH };
}

function componentToHex(c: number): string {
    return c.toString(16).padStart(2, '0');
}
function rgbToHex(r: number, g: number, b: number): string { return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`; }
