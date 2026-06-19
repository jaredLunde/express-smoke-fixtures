// Smoke fixture: the app the deploy ultimately starts. The interesting part is
// migrate.js (the pre-deploy command), which runs after build / before this
// server starts and reaches a companion DB-like service over the private
// network — proving privnet is up during the pre-deploy phase. This file is
// just a tiny stateless server so the deploy reaches a healthy SUCCESS.
const http = require("http");
const port = process.env.PORT || 8080;

console.log("smoke-fixture/predeploy-migration booting");

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
