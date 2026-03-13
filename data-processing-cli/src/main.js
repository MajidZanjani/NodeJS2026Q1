import os from "node:os";
import { startRepl } from "./repl.js";

const homeDir = os.homedir();

console.log("Welcome to Data Processing CLI!");
console.log(`You are currently in ${homeDir}`);

startRepl(homeDir);
