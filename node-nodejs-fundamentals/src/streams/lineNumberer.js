import { Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let leftover = "";

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      const numbered = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");
      callback(null, numbered + "\n");
    },
    flush(callback) {
      if (leftover) {
        callback(null, `${lineNumber++} | ${leftover}`);
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

lineNumberer();
