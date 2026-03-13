import fs from "node:fs";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export async function decryptCommand(currentDir, args) {
  try {
    const input = resolvePath(currentDir, args.input);
    const output = resolvePath(currentDir, args.output);
    const password = args.password;

    if (!fs.existsSync(input) || !password) {
      console.log("Operation failed");
      return;
    }

    const stats = fs.statSync(input);
    const fileSize = stats.size;

    if (fileSize < 44) {
      console.log("Operation failed");
      return;
    }

    const fd = fs.openSync(input, "r");
    const header = Buffer.alloc(28);

    fs.readSync(fd, header, 0, 28, 0);
    const salt = header.subarray(0, 16);
    const iv = header.subarray(16, 28);

    const authTag = Buffer.alloc(16);
    fs.readSync(fd, authTag, 0, 16, fileSize - 16);

    fs.closeSync(fd);

    const key = crypto.scryptSync(password, salt, 32);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const readStream = fs.createReadStream(input, {
      start: 28,
      end: fileSize - 17,
    });

    const writeStream = fs.createWriteStream(output);
    await pipeline(readStream, decipher, writeStream);
  } catch {
    console.log("Operation failed");
  }
}
