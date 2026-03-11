import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { resolvePath } from "../utils/pathResolver.js";

export async function countCommand(currentDir, args) {
  const file = resolvePath(currentDir, args.input);

  let lines = 0;
  let words = 0;
  let chars = 0;

  const counter = new Transform({
    transform(chunk, enc, cb) {
      const text = chunk.toString();

      chars += text.length;
      lines += text.split("\n").length - 1;
      words += text.trim().split(/\s+/).filter(Boolean).length;

      cb(null, chunk);
    },
  });

  await pipeline(fs.createReadStream(file), counter);

  console.log(`Lines: ${lines}`);
  console.log(`Words: ${words}`);
  console.log(`Characters: ${chars}`);
}
