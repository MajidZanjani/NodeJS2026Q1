import fs from "node:fs";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export async function encryptCommand(currentDir, args) {
  try {
    const input = resolvePath(currentDir, args.input);
    const output = resolvePath(currentDir, args.output);
    const password = args.password;

    console.log(input, output, password);

    if (!fs.existsSync(input) || !password) {
      console.log("Operation failed");
      return;
    }

    const salt = crypto.randomBytes(16);

    const iv = crypto.randomBytes(12);

    const key = crypto.scryptSync(password, salt, 32);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const readStream = fs.createReadStream(input);
    const writeStream = fs.createWriteStream(output);

    writeStream.write(Buffer.concat([salt, iv]));

    await pipeline(readStream, cipher, writeStream);

    const authTag = cipher.getAuthTag();
    fs.appendFileSync(output, authTag);
  } catch (error) {
    console.log("Operation failed");
  }
}
