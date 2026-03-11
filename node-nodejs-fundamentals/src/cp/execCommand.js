import { spawn } from "child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  if (!commandString) {
    console.error("Please provide a command");
    process.exit(1);
  }

  const [command, ...args] = commandString.split(" ");

  const child = spawn(command, args, {
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });

  child.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
};

execCommand();
