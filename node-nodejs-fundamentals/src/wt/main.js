import { Worker } from "worker_threads";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mergeKWay = (arrays) => {
  const pointers = new Array(arrays.length).fill(0);
  const result = [];

  while (true) {
    let min = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (pointers[i] < arrays[i].length) {
        const value = arrays[i][pointers[i]];
        if (value < min) {
          min = value;
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) break;

    result.push(min);
    pointers[minIndex]++;
  }

  return result;
};

const main = async () => {
  const dataPath = path.join(__dirname, "data.json");

  const file = await fs.readFile(dataPath, "utf-8");
  const numbers = JSON.parse(file);

  const cpuCount = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / cpuCount);

  const chunks = [];

  for (let i = 0; i < cpuCount; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const sortedChunks = await Promise.all(
    chunks.map((chunk) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./worker.js", import.meta.url));

        worker.on("message", (result) => {
          resolve(result);
          worker.terminate();
        });
        worker.on("error", reject);
        worker.postMessage(chunk);
      });
    }),
  );

  const finalSorted = mergeKWay(sortedChunks);

  console.log(finalSorted);
};

await main();
