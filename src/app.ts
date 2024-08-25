import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { File } from "./file.js";
import { glob } from "glob";
import { Offsets } from "./types.js";
import { PromisePool } from '@supercharge/promise-pool'

export type ApplicationOptions = {
  source: string;
  target: string;
  offset: Offsets;
};

export class Application {
  private options: ApplicationOptions;

  constructor(options: ApplicationOptions) {
    this.options = options;
  }

  get offset() {
    return this.options.offset;
  }

  async readSource(filename: string) {
    return await readFile(path.join(this.options.source, filename));
  }

  private _createTargetDirectory?: Promise<unknown>;

  private async createTargetDirectory() {
    let promise = this._createTargetDirectory;
    if(!promise) {
      promise = mkdir(this.options.target, { recursive: true });
      this._createTargetDirectory = promise;
    }
    return promise;
  }

  async writeTarget(buffer: Buffer, filename: string) {
    await this.createTargetDirectory();
    await writeFile(path.join(this.options.target, filename), buffer);
  }

  private file(filename: string) {
    return new File({ filename, app: this });
  }

  private async files() {
    const cwd = this.options.source;
    const filenames = await glob(['*.tif', '*.jpg', '*.jpeg'], { cwd });
    return filenames.map((filename) => this.file(filename));
  }

  async normalize() {
    const files = await this.files();
    const total = files.length;
    let processed = 0;
    await PromisePool.withConcurrency(10).for(files).process(async (file) => {
      let { filename } = await file.normalize();
      processed++;
      console.log(filename, '–', `${processed} / ${total}`);
    });
  }
}
