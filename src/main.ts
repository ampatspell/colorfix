#!/usr/bin/env node --max_old_space_size=8192

import { Application } from "./app.js";
import minimist from "minimist";

const args = minimist(process.argv.slice(2));
const [ source, target ] = args._;

const help = () => {
  console.log('usage: colorfix source target [-c 10] [--skip]');
}

if(!source || !target || args.help) {
  help();
  process.exit(-1);
}

const concurrency = args.c as number ?? 10;
const skip = args.skip === true ?? false;
const offset = 500;

const application = new Application({
  source,
  target,
  concurrency,
  offset: { top: offset, bottom: offset, left: offset, right: offset },
  skip,
});

await application.normalize();
