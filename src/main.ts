#!/usr/bin/env node

import { Application } from "./app.js";
import minimist from "minimist";

const args = minimist(process.argv.slice(2));
const [ source, target ] = args._;

const help = () => {
  console.log('usage: colorfix source target');
}

if(!source || !target || args.help) {
  help();
  process.exit(-1);
}

const offset = 500;

const application = new Application({
  source,
  target,
  offset: { top: offset, bottom: offset, left: offset, right: offset },
});

await application.normalize();
