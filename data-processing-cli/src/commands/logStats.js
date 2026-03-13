// logStatsCommand.js
import fs from "node:fs";
import os from "node:os";
import { Worker } from "node:worker_threads";
import { resolvePath } from "../utils/pathResolver.js";

function mergeStats(a, b) {
  const merged = {
    total: a.total + b.total,
    levels: { ...a.levels },
    status: { ...a.status },
    paths: { ...a.paths },
    responseTimeSum: a.responseTimeSum + b.responseTimeSum,
  };

  for (const key in b.levels)
    merged.levels[key] = (merged.levels[key] || 0) + b.levels[key];
  for (const key in b.status)
    merged.status[key] = (merged.status[key] || 0) + b.status[key];
  for (const key in b.paths)
    merged.paths[key] = (merged.paths[key] || 0) + b.paths[key];

  return merged;
}

export async function logStatsCommand(currentDir, args) {
  try {
    const input = resolvePath(currentDir, args.input);
    const output = resolvePath(currentDir, args.output);

    if (!fs.existsSync(input)) {
      throw new Error("Operation failed: input file does not exist");
    }

    const allLines = fs.readFileSync(input, "utf-8").split("\n");
    const totalLines = allLines.length;

    const numCores = os.cpus().length;
    const linesPerWorker = Math.ceil(totalLines / numCores);

    const workers = [];
    const partialResults = [];

    for (let i = 0; i < numCores; i++) {
      const startLine = i * linesPerWorker;
      let endLine = (i + 1) * linesPerWorker - 1;
      if (endLine >= totalLines) endLine = totalLines - 1;
      if (startLine > endLine) break;

      const worker = new Worker(
        new URL("../workers/logWorker.js", import.meta.url),
        { workerData: { inputPath: input, startLine, endLine } },
      );

      workers.push(worker);

      worker.on("message", (msg) => partialResults.push(msg));
      worker.on("error", (err) => console.error("Worker error:", err));
      worker.on("exit", (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
      });
    }

    await Promise.all(
      workers.map((w) => new Promise((res) => w.on("exit", res))),
    );

    let finalStats = {
      total: 0,
      levels: {},
      status: {},
      paths: {},
      responseTimeSum: 0,
    };
    for (const pr of partialResults) finalStats = mergeStats(finalStats, pr);

    const avgResponseTimeMs =
      finalStats.total > 0 ? finalStats.responseTimeSum / finalStats.total : 0;

    const topPaths = Object.entries(finalStats.paths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const outputJson = {
      total: finalStats.total,
      levels: finalStats.levels,
      status: finalStats.status,
      topPaths,
      avgResponseTimeMs: parseFloat(avgResponseTimeMs.toFixed(2)),
    };

    fs.writeFileSync(output, JSON.stringify(outputJson, null, 2), "utf-8");
    console.log(`Stats written to ${output}`);
  } catch (err) {
    console.error("Operation failed");
  }
}
