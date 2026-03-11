import fs from "node:fs";
import { readFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import crypto from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";

export async function hashCompareCommand(currentDir, args) {
  const file = resolvePath(currentDir, args.input);
  const hashFile = resolvePath(currentDir, args.hash);
  const algorithm = args.algorithm || "sha256";

  if (!["sha256", "md5", "sha512"].includes(algorithm)) {
    throw new Error(`Invalid algorithm: ${algorithm}`);
  }

  try {
    await fs.promises.access(file, fs.constants.F_OK | fs.constants.R_OK);
    await fs.promises.access(hashFile, fs.constants.F_OK | fs.constants.R_OK);
  } catch {
    throw new Error(
      `File does not exist or is not readable: ${file} or ${hashFile}`,
    );
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
  const savedHash = await readFile(hashFile, { encoding: "utf8" });
  console.log(digest);
  console.log(savedHash);

  console.log(digest == savedHash ? "OK" : "MISMATCH");
}
