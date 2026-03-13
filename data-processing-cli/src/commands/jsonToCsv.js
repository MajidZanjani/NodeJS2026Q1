import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export async function jsonToCsvCommand(currentDir, args) {
  try {
    const input = resolvePath(currentDir, args.input);
    const output = resolvePath(currentDir, args.output);

    if (!fs.existsSync(input)) {
      console.log("Operation failed");
      return;
    }

    let jsonBuffer = "";

    const jsonTransformable = new Transform({
      transform(chunk, enc, cb) {
        jsonBuffer += chunk.toString();
        cb();
      },

      flush(cb) {
        try {
          const data = JSON.parse(jsonBuffer);

          if (!Array.isArray(data) || data.length === 0) {
            cb(null, "");
            return;
          }

          const headers = Object.keys(data[0]);
          let csv = headers.join(",") + "\n";

          for (const row of data) {
            const values = headers.map((h) => row[h]);
            csv += values.join(",") + "\n";
          }
          cb(null, csv);
        } catch (err) {
          cb(err);
        }
      },
    });

    await pipeline(
      fs.createReadStream(input),
      jsonTransformable,
      fs.createWriteStream(output),
    );
  } catch (error) {
    console.log("Operation failed");
  }
}
