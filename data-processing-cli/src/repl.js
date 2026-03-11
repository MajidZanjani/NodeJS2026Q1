import readline from "node:readline";
import { handleNavigation } from "./navigation.js";

export function startRepl(initialDir) {
  let currentDir = initialDir;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === ".exit") {
      exit(rl);
      return;
    }

    try {
      const result = await handleNavigation(input, currentDir);

      if (result?.newDir) {
        currentDir = result.newDir;
      }

      console.log(`You are currently in ${currentDir}`);
    } catch {
      console.log("Operation failed");
    }

    rl.prompt();
  });

  rl.on("SIGINT", () => exit(rl));
}

function exit(rl) {
  console.log("Thank you for using Data Processing CLI!");
  rl.close();
  process.exit(0);
}
