import { Raw } from "./file.js";

export type Offsets = {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

type Pixel = {
  r: number;
  g: number;
  b: number;
}

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Range = { min: number; max: number };
type Ranges = { r: Range, g: Range; b: Range; };

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

const getRanges = (pixels: Pixel[]): Ranges => {
  let r = getRange(pixels, 'r');
  let g = getRange(pixels, 'g');
  let b = getRange(pixels, 'b');
  return {
    r,
    g,
    b
  };
}

const toRange = (value: number, range: Range) => {
  const { min, max } = range;
  return (value - min) / (max - min) * 256;
}

const setRanges = (pixel: Pixel, ranges: Ranges) => {
  let r = toRange(pixel.r, ranges.r);
  let g = toRange(pixel.g, ranges.g);
  let b = toRange(pixel.b, ranges.b);
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

export const normalize = (raw: Raw, opts: { offset: Offsets }) => {
  const { data, info: { width, height } } = raw;
  const size = { width, height };
  const { offset } = opts;

  let pixels = getPixels(data, size, offset);
  let ranges = getRanges(pixels);

  update(data, size, ranges);
}
