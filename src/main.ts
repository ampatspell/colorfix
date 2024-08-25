import path from "path";
import { fileURLToPath } from 'url';
import { Application } from "./app.js";

const __dirname = fileURLToPath(path.dirname(import.meta.url));
const files = path.join(__dirname, '..', 'files');

const application = new Application({
  source: path.join(files, 'input'),
  target: path.join(files, 'output'),
  offset: { top: 250, bottom: 250, left: 250, right: 250 }
});

await application.normalize();
