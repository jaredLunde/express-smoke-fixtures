// Smoke fixture: boots, serves `/` and `/healthz` so the deploy passes its
// health gate and goes LIVE (SUCCESS), then exits non-zero — a RUNTIME crash
// *after* a successful deploy. Contrast with crash-on-boot, which dies during
// the deploy → FAILED. The runtime crash should surface as CRASHED.
//
// vm-init/podman auto-restart the workload, so to reach the *durable* crash
// states quickly (RESTART_BACKOFF once the exponential backoff exceeds ~5s, and
// TERMINATED once max restarts are exhausted) we crash slowly on the FIRST life
// (long enough to reach SUCCESS) and then fast on every restart. A marker file
// in the working dir persists across in-VM process restarts, so the workload
// crash-loops rapidly after the first success and the deployment reliably goes
// CRASHED within the watch window.
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 8080;
const marker = path.join(process.cwd(), ".smoke-restart-marker");
const isRestart = fs.existsSync(marker);
try {
  fs.writeFileSync(marker, String(Date.now()));
} catch {
  // best-effort; if the fs is read-only the first-life timing still applies
}

console.log("smoke-fixture/crash-after-serve booting", isRestart ? "(restart)" : "(first life)");
console.log(`RAILWAY_DEPLOYMENT_ID=${process.env.RAILWAY_DEPLOYMENT_ID || ""}`);
console.log(`RAILWAY_REPLICA_ID=${process.env.RAILWAY_REPLICA_ID || ""}`);

http
  .createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("healthy");
      return;
    }
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(`ok ${process.env.RAILWAY_REPLICA_ID || ""}`);
  })
  .listen(port, () => console.log(`listening on ${port}`));

// First life: crash well after the health gate so it's unambiguously a RUNTIME
// crash (CRASHED), not a deploy-time failure (FAILED). Restarts: crash fast so
// the restart backoff escalates into the durable RESTART_BACKOFF/TERMINATED
// states quickly. Both tunable via env.
const delayMs = isRestart
  ? Number(process.env.CRASH_ON_RESTART_MS || 2000)
  : Number(process.env.CRASH_AFTER_MS || 60000);
setTimeout(() => {
  console.error(`smoke-fixture/crash-after-serve: intentional runtime crash (exit 1) after ${delayMs}ms`);
  process.exit(1);
}, delayMs);
