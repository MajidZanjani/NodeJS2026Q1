import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export async function csvToJsonCommand(currentDir, args) {
  try {
    const input = resolvePath(currentDir, args.input);
    const output = resolvePath(currentDir, args.output);

    if (!fs.existsSync(input)) {
      console.log("Operation failed");
      return;
    }

    let headers = null;
    let isFirstObject = true;
    let leftover = "";

    const csvTransform = new Transform({
      readableObjectMode: false,

      transform(chunk, enc, cb) {
        try {
          const data = leftover + chunk.toString();
          const lines = data.split("\n");

          leftover = lines.pop();

          let outputChunk = "";

          for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (!headers) {
              headers = line.split(",");
              outputChunk += "[\n";
              continue;
            }

            const values = line.split(",");
            const obj = {};

            headers.forEach((header, i) => {
              obj[header] = values[i] ?? "";
            });

            const json = "  " + JSON.stringify(obj);

            if (!isFirstObject) {
              outputChunk += ",\n";
            }

            outputChunk += json;
            isFirstObject = false;
          }

          cb(null, outputChunk);
        } catch (err) {
          cb(err);
        }
      },

      flush(cb) {
        try {
          if (leftover && headers) {
            const values = leftover.trim().split(",");
            const obj = {};

            headers.forEach((header, i) => {
              obj[header] = values[i] ?? "";
            });

            const json = JSON.stringify(obj, null, 2);

            if (!isFirstObject) {
              this.push(",\n");
            }

            this.push(json);
          }

          this.push("\n]");
          cb();
        } catch (err) {
          cb(err);
        }
      },
    });

    await pipeline(
      fs.createReadStream(input),
      csvTransform,
      fs.createWriteStream(output),
    );
  } catch (error) {
    console.log("Operation failed");
  }
}
