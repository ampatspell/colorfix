export const Channels = ['r', 'g', 'b'] as const;
export type Channel = typeof Channels[number];

export type Raw = {
  data: Buffer;
  size: Size;
};

export type Offsets = {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type Pixel = {
  [key in Channel]: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Range = {
  min: number;
  max: number;
};

export type Ranges = {
  [key in Channel]: Range;
};
