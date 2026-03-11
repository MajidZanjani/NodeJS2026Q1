import fs from "fs";
import path from "path";
import { promises as fsp } from "fs";
import { createBrotliCompress } from "zlib";

const compressDir = async () => {
  const srcDir = path.resolve("workspace/toCompress");
  const destDir = path.resolve("workspace/compressed");
  const archivePath = path.join(destDir, "archive.br");

  try {
    await fsp.access(srcDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsp.mkdir(destDir, { recursive: true });

  const brotli = createBrotliCompress();
  const writeStream = fs.createWriteStream(archivePath);

  brotli.pipe(writeStream);

  const walk = async (dir) => {
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(srcDir, fullPath);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const stat = await fsp.stat(fullPath);

        brotli.write(`FILE:${relPath}:${stat.size}\n`);

        await new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(fullPath);

          readStream.on("error", reject);
          readStream.on("end", () => {
            brotli.write("\n");
            resolve();
          });

          readStream.pipe(brotli, { end: false });
        });
      }
    }
  };

  await walk(srcDir);

  brotli.end();

  await new Promise((resolve) => writeStream.on("finish", resolve));
};

await compressDir();
