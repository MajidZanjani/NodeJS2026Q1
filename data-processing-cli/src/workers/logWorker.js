import fs from "fs";
import { workerData, parentPort } from "node:worker_threads";

function parseLine(line) {
  const parts = line.trim().split(" ");
  if (parts.length < 6) return null;
  const [
    timestamp,
    level,
    service,
    statusCode,
    responseTimeMs,
    method,
    ...rest
  ] = parts;
  if (!statusCode || isNaN(Number(responseTimeMs))) return null;
  return {
    level,
    statusCode,
    path: rest.join(" "),
    responseTimeMs: Number(responseTimeMs),
  };
}

function getStatusClass(code) {
  return code.toString()[0] + "xx";
}

const { inputPath, startLine, endLine } = workerData;
const allLines = fs
  .readFileSync(inputPath, "utf-8")
  .split("\n")
  .slice(startLine, endLine + 1);

const stats = {
  total: 0,
  levels: {},
  status: {},
  paths: {},
  responseTimeSum: 0,
};

for (const line of allLines) {
  if (!line.trim()) continue;
  const parsed = parseLine(line);
  if (!parsed) continue;
  const { level, statusCode, path, responseTimeMs } = parsed;
  stats.total++;
  stats.levels[level] = (stats.levels[level] || 0) + 1;
  const statusClass = getStatusClass(statusCode);
  stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;
  stats.paths[path] = (stats.paths[path] || 0) + 1;
  stats.responseTimeSum += responseTimeMs;
}

parentPort.postMessage(stats);
process.exit(0);
