// Starts the API and the Angular dev server together, each on a free port.
// The API takes the first free port from PORT (default 3000); the web app takes
// the first free port from WEB_PORT (default 4200) and proxies /api to the API.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontend = path.join(root, "frontend");
const require = createRequire(path.join(frontend, "package.json"));
const ngBin = path.join(path.dirname(require.resolve("@angular/cli/package.json")), "bin", "ng.js");
const children = [];
let running = false;

/** True when nothing answers on localhost:port and the port can be bound. */
async function isFree(port) {
  // On Windows, binding all interfaces can succeed even while another server
  // (e.g. a leftover ng serve) holds [::1]:port, so probe localhost first.
  const answers = await new Promise((resolve) => {
    const socket = net.connect({ port, host: "localhost" })
      .once("connect", () => { socket.destroy(); resolve(true); })
      .once("error", () => resolve(false));
  });
  if (answers) return false;
  return new Promise((resolve) => {
    const server = net.createServer()
      .once("error", () => resolve(false))
      .once("listening", () => server.close(() => resolve(true)))
      .listen(port);
  });
}

async function freePort(start) {
  for (let port = start; port < start + 50; port++) if (await isFree(port)) return port;
  throw new Error(`No free port found between ${start} and ${start + 49}.`);
}

function run(args, options) {
  const child = spawn(process.execPath, args, { ...options, env: { ...process.env, ...options.env } });
  children.push(child);
  child.on("exit", (code) => {
    children.splice(children.indexOf(child), 1);
    // Once both are up, stopping either one stops the whole session.
    if (running) stopAll(code ?? 0);
  });
  return child;
}

function stopAll(code) {
  for (const child of children.splice(0)) child.kill();
  process.exit(code);
}

/** Starts the API and resolves with the port it listens on, or null if it stopped first. */
function startApi() {
  return new Promise((resolve) => {
    const api = run(["src/server.js"], { cwd: path.join(root, "backend"), stdio: ["ignore", "pipe", "inherit"] });
    api.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      const match = /listening on http:\/\/localhost:(\d+)/.exec(chunk.toString());
      if (match) resolve(Number(match[1]));
    });
    // Keep the web app running in demo mode if the API cannot start.
    api.once("exit", () => resolve(null));
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

const apiPort = await startApi();
if (!apiPort) console.warn("\nThe API did not start, so the web app will run in demo mode.\n");
const webPort = await freePort(Number(process.env.WEB_PORT || 4200));
run([ngBin, "serve", "--port", String(webPort)], {
  cwd: frontend,
  stdio: "inherit",
  env: apiPort ? { API_PORT: String(apiPort) } : {}
});
running = true;
console.log(`\nToonbox: http://localhost:${webPort}${apiPort ? `  (API on port ${apiPort})` : ""}\n`);
