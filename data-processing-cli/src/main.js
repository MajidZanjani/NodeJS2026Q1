import readline from "readline";
// entry point, sets up REPL, handles navigation state
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

const main = async () => {
  console.log("Welcome to Data Processing CLI!");
};

await main();
