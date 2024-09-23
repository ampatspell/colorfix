import { Offsets, Pixel, Point, Range, Ranges, Raw, Size } from "./types.js";

export const toIndex = (position: Point, size: Size) => {
  return position.y * size.width + position.x;
};

export const fromIndex = (index: number, size: Size): Point => {
  const y = Math.floor(index / size.width);
  const x = index - y * size.width;
  return { x, y };
};

const getPixel = (data: Buffer, size: Size, point: Point): Pixel => {
  const { x, y } = point;
  const index = toIndex({ x, y }, size);
  const base = index * 3;
  return {
    r: data[base],
    g: data[base + 1],
    b: data[base + 2],
  };
}

const setPixel = (data: Buffer, size: Size, point: Point, pixel: Pixel) => {
  const { x, y } = point;
  const index = toIndex({ x, y }, size);
  const base = index * 3;
  data[base] = pixel.r;
  data[base + 1] = pixel.g;
  data[base + 2] = pixel.b;
}

const getPixels = (data: Buffer, size: Size, offset: Offsets) => {
  const pixels = [];
  for(let x = offset.left; x < size.width - offset.right; x++) {
    for(let y = offset.top; y < size.height - offset.bottom; y++) {
      pixels.push(getPixel(data, size, { x, y }));
    }
  }
  return pixels;
}

const getRange = (pixels: Pixel[], channel: keyof Pixel): Range => {
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;
  pixels.forEach((pixel) => {
    let value = pixel[channel];
    if(min === undefined || min > value) {
      min = value;
    }
    if(max === undefined || max < value) {
      max = value;
    }
  });
  return {
    min: min!,
    max: max!
  };
}

const getRangesFromPixels = (pixels: Pixel[]): Ranges => {
  const r = getRange(pixels, 'r');
  const g = getRange(pixels, 'g');
  const b = getRange(pixels, 'b');
  return {
    r,
    g,
    b
  };
}

const getRanges = (data: Buffer, size: Size, offset: Offsets) => {
  const pixels = getPixels(data, size, offset);
  return getRangesFromPixels(pixels);
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
}

const toRange = (value: number, range: Range) => {
  const { min, max } = range;
  const scaled = (value - min) / (max - min) * 255;
  return clamp(scaled, 0, 255);
}

const setRanges = (pixel: Pixel, ranges: Ranges) => {
  const r = toRange(pixel.r, ranges.r);
  const g = toRange(pixel.g, ranges.g);
  const b = toRange(pixel.b, ranges.b);
  return {
    r,
    g,
    b
  };
}

const update = (data: Buffer, size: Size, ranges: Ranges) => {
  for(let x = 0; x < size.width; x++) {
    for(let y = 0; y < size.height; y++) {
      const original = getPixel(data, size, { x, y });
      const updated = setRanges(original, ranges);
      setPixel(data, size, { x, y }, updated);
    }
  }
}

export const process = (raw: Raw, offset: Offsets) => {
  const { data, size } = raw;
  const ranges = getRanges(data, size, offset);
  update(data, size, ranges);
}
