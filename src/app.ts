import { readFile, writeFile } from "fs/promises";
import path from "path";
import { File } from "./file.js";
import { glob } from "glob";
import { normalize, Offsets } from "./normalize.js";

export type ApplicationOptions = {
  source: string;
  target: string;
  offset: Offsets;
};

export class Application {
  options: ApplicationOptions;

  constructor(options: ApplicationOptions) {
    this.options = options;
  }

  async readSource(filename: string) {
    return await readFile(path.join(this.options.source, filename));
  }

  async writeTarget(buffer: Buffer, filename: string) {
    await writeFile(path.join(this.options.target, filename), buffer);
  }

  file(filename: string) {
    return new File({ filename, app: this });
  }

  async files() {
    const filenames = await glob('*.tif', { cwd: this.options.source });
    return filenames.map((filename) => this.file(filename));
  }

  async normalizeFile(file: File) {
    const raw = await file.raw();
    const offset = this.options.offset;
    normalize(raw, { offset });
    await file.save(raw);
  }

  async normalize() {
    const files = await this.files();
    await Promise.all(files.map(async (file) => {
      await this.normalizeFile(file);
    }))
  }
}
