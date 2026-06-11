// Smoke fixture: a tiny stateless HTTP server. Zero dependencies.
const http = require("http");
const port = process.env.PORT || 8080;

// Boot logs the harness asserts against (env injection, replica id, commit pin).
console.log("smoke-fixture/main booting");
console.log(`RAILWAY_DEPLOYMENT_ID=${process.env.RAILWAY_DEPLOYMENT_ID || ""}`);
console.log(`RAILWAY_REPLICA_ID=${process.env.RAILWAY_REPLICA_ID || ""}`);
console.log(`RAILWAY_GIT_COMMIT_SHA=${process.env.RAILWAY_GIT_COMMIT_SHA || ""}`);
console.log(`SMOKE_ECHO=${process.env.SMOKE_ECHO || ""}`);

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

// v2
