// Smoke fixture: delays listening to exercise the healthcheck timeout.
const http = require("http");
const port = process.env.PORT || 8080;
const delayMs = Number(process.env.SLOW_MS || 45000);

console.log(`smoke-fixture/slow-start booting; sleeping ${delayMs}ms before listening`);

setTimeout(() => {
  http
    .createServer((req, res) => {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(req.url === "/healthz" ? "healthy" : "ok (slow)");
    })
    .listen(port, () => console.log(`listening on ${port} after ${delayMs}ms`));
}, delayMs);
