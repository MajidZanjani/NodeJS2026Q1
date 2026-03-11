import fs from "fs";
import { Transform } from "stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const split = async () => {
  const args = process.argv.slice(2);
  const linesIndex = args.indexOf("--lines");

  let maxLines = 10;
  if (linesIndex !== -1 && args[linesIndex + 1]) {
    const parsed = parseInt(args[linesIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxLines = parsed;
    }
  }

  const sourcePath = path.join(__dirname, "files", "source.txt");

  const readable = fs.createReadStream(sourcePath, {
    encoding: "utf-8",
  });

  let buffer = "";
  let lineCount = 0;
  let chunkIndex = 1;
  let writable = fs.createWriteStream(
    path.join(__dirname, "files", `chunk_${chunkIndex}.txt`),
  );

  const splitter = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        writable.write(line + "\n");
        lineCount++;

        if (lineCount >= maxLines) {
          writable.end();
          chunkIndex++;
          writable = fs.createWriteStream(
            path.join(__dirname, "files", `chunk_${chunkIndex}.txt`),
          );
          lineCount = 0;
        }
      }

      callback();
    },

    flush(callback) {
      if (buffer) {
        writable.write(buffer + "\n");
        lineCount++;
      }

      writable.end();
      callback();
    },
  });

  readable.pipe(splitter);
};

await split();
