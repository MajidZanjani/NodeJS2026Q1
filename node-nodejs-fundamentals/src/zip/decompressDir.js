import fs from "fs";
import path from "path";
import { promises as fsp } from "fs";
import { createBrotliDecompress } from "zlib";
import { pipeline } from "stream/promises";

const decompressDir = async () => {
  const srcDir = path.resolve("workspace/compressed");
  const archivePath = path.join(srcDir, "archive.br");
  const destDir = path.resolve("workspace/decompressed");

  try {
    await fsp.access(srcDir);
    await fsp.access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsp.mkdir(destDir, { recursive: true });

  const decompress = createBrotliDecompress();
  const readStream = fs.createReadStream(archivePath);

  let buffer = Buffer.alloc(0);

  decompress.on("data", async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) break;

      const header = buffer.slice(0, newlineIndex).toString();
      if (!header.startsWith("FILE:")) break;

      const [, relPath, sizeStr] = header.split(":");
      const size = Number(sizeStr);

      const contentStart = newlineIndex + 1;
      const contentEnd = contentStart + size;

      if (buffer.length < contentEnd) break;

      const fileContent = buffer.slice(contentStart, contentEnd);

      const filePath = path.join(destDir, relPath);
      await fsp.mkdir(path.dirname(filePath), { recursive: true });

      await fsp.writeFile(filePath, fileContent);

      buffer = buffer.slice(contentEnd + 1);
    }
  });

  await pipeline(readStream, decompress);
};

await decompressDir();
