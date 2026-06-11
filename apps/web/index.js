// Monorepo fixture — the apps/web app, the CORRECT target when the service's
// rootDirectory is "apps/web". Serves "web-ok" and logs a unique marker so the
// harness can prove the agent built+started in the subdir, not the repo root.
const http = require("http");
const port = process.env.PORT || 8080;
console.log("smoke-fixture/monorepo WEB app (rootDirectory applied: apps/web)");
http
  .createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("healthy");
      return;
    }
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("web-ok");
  })
  .listen(port, () => console.log(`listening on ${port}`));
