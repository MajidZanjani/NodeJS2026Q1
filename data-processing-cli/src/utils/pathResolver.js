import path from "node:path";

export function resolvePath(currentDir, inputPath) {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }

  return path.resolve(currentDir, inputPath);
}
