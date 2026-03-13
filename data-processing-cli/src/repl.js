import readline from "node:readline";
import { handleNavigation } from "./navigation.js";
import { countCommand } from "./commands/count.js";
import { hashCommand } from "./commands/hash.js";
import { hashCompareCommand } from "./commands/hashCompare.js";
import { parseArgs } from "./utils/argParser.js";
import { csvToJsonCommand } from "./commands/csvToJson.js";
import { jsonToCsvCommand } from "./commands/jsonToCsv.js";

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
    const parts = input.split(" ");
    const command = parts[0];

    try {
      let result;
      const args = parseArgs(parts.slice(1));
      switch (command) {
        case "count":
          await countCommand(currentDir, args);
          rl.prompt();
          return;
        case "hash":
          await hashCommand(currentDir, args);
          rl.prompt();
          return;
        case "hash-compare":
          await hashCompareCommand(currentDir, args);
          rl.prompt();
          return;
        case "csv-to-json":
          await csvToJsonCommand(currentDir, args);
          rl.prompt();
          return;
        case "json-to-csv":
          await jsonToCsvCommand(currentDir, args);
          rl.prompt();
          return;
        case ".exit":
          exit(rl);
          return;
        default:
          result = await handleNavigation(input, currentDir);
      }

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
