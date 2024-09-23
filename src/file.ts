import sharp from "sharp";
import { type Application } from "./app.js";
import assert from "assert";
import { Raw } from "./types.js";
import { process } from "./process.js";
import { basename, extname, parse } from "path";

const CHANNELS = 3;

export type FileOptions = {
  app: Application;
  filename: string;
};

export class File {
  private options: FileOptions;

  constructor(options: FileOptions) {
    this.options = options;
  }

  private get app() {
    return this.options.app;
  }

  private get filename() {
    return this.options.filename;
  }

  private async raw() {
    const buffer = await this.app.readSource(this.filename);
    const { data, info: { width, height, channels } } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    assert(channels === CHANNELS, `File must have ${CHANNELS} channels`);
    return {
      data,
      size: {
        width,
        height,
      },
    } satisfies Raw;
  }

  private async save(raw: Raw) {
    const { data, size } = raw;
    const buffer = await sharp(data, {
      raw: {
        ...size,
        channels: CHANNELS,
      }
    }).tiff({
      compression: 'deflate',
    }).toBuffer();
    const { name } = parse(this.filename);
    const filename = `${name}.tif`;
    await this.app.writeTarget(buffer, filename);
    return filename;
  }

  private process(raw: Raw) {
    if(!this.app.skip) {
      const offset = this.app.offset;
      process(raw, offset);
    }
  }

  async normalize() {
    const raw = await this.raw();
    this.process(raw);
    const filename = await this.save(raw);
    return {
      filename,
    };
  }
}
