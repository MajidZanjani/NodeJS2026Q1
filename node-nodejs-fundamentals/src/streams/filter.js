import { Transform } from "stream";

const filter = () => {
  const getArgValue = (flag) => {
    const index = process.argv.indexOf(flag);
    if (index !== -1 && process.argv[index + 1]) {
      return process.argv[index + 1];
    }
    return null;
  };

  const pattern = getArgValue("--pattern");

  if (!pattern) {
    console.error("Please provide --pattern <string>");
    process.exit(1);
  }

  let leftover = "";

  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }

      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    },
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
