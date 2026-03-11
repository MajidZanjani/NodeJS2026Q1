import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import crypto from "node:crypto";
import path from "node:path";
import { resolvePath } from "../utils/pathResolver.js";

export async function hashCommand(currentDir, args) {
  const file = resolvePath(currentDir, args.input);
  const algorithm = args.algorithm || "sha256";
  const save = "save" in args;

  if (!["sha256", "md5", "sha512"].includes(algorithm)) {
    throw new Error(`Invalid algorithm: ${algorithm}`);
  }

  try {
    await fs.promises.access(file, fs.constants.F_OK | fs.constants.R_OK);
  } catch {
    throw new Error(`File does not exist or is not readable: ${file}`);
  }

  const hash = crypto.createHash(algorithm);

  const hashStream = new Transform({
    transform(chunk, enc, cb) {
      hash.update(chunk);
      cb(null, chunk);
    },
  });

  await pipeline(fs.createReadStream(file), hashStream);

  const digest = hash.digest("hex");
  console.log(`${algorithm}: ${digest}`);

  if (save) {
    const fileName = path.basename(file);
    const saveFile = path.join(currentDir, `${fileName}.${algorithm}.hash`);
    await fs.promises.writeFile(saveFile, digest, "utf-8");
    console.log(`Hash saved to: ${saveFile}`);
  }
}
