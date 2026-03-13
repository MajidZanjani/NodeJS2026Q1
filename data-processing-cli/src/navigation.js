import fs from "node:fs/promises";
import path from "node:path";
import { resolvePath } from "./utils/pathResolver.js";

export async function handleNavigation(input, currentDir) {
  const [command, arg] = input.split(" ");

  if (command === "up") {
    const parent = path.dirname(currentDir);
    return { newDir: parent };
  }

  if (command === "cd") {
    if (!arg) throw new Error();

    const target = resolvePath(currentDir, arg);
    const stat = await fs.stat(target);

    if (!stat.isDirectory()) throw new Error();

    return { newDir: target };
  }

  if (command === "ls") {
    const items = await fs.readdir(currentDir, { withFileTypes: true });

    const folders = [];
    const files = [];

    for (const item of items) {
      if (item.isDirectory()) folders.push(item.name);
      else files.push(item.name);
    }

    folders.sort();
    files.sort();

    for (const f of folders) {
      console.log(`${f} [folder]`);
    }

    for (const f of files) {
      console.log(`${f} [file]`);
    }

    return {};
  }

  throw new Error("Invalid input");
}
