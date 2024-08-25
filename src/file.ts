import sharp from "sharp";
import { type Application } from "./app.js";
import assert from "assert";

export type FileOptions = {
  app: Application;
  filename: string;
};

export type Raw = {
  data: Buffer;
  info: {
    width: number;
    height: number;
    channels: 1 | 2 | 3 | 4;
  };
};

export class File {
  options: FileOptions;

  constructor(options: FileOptions) {
    this.options = options;
  }

  async raw(): Promise<Raw> {
    let buffer = await this.options.app.readSource(this.options.filename);
    let { data, info: { width, height, channels } } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    assert(channels === 3, 'File must have 3 channels');
    return {
      data,
      info: {
        width,
        height,
        channels,
      },
    };
  }

  async save(opts: Raw) {
    let output = await sharp(opts.data, {
      raw: {
        width: opts.info.width,
        height: opts.info.height,
        channels: opts.info.channels,
      }
    }).tiff().toBuffer();
    await this.options.app.writeTarget(output, this.options.filename);
  }
}
