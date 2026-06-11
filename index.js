// Monorepo fixture — ROOT app. This is the WRONG target: if rootDirectory is
// ignored, the agent builds+starts here and serves "root". The harness asserts
// it serves the apps/web app instead (rootDirectory applied).
const http = require("http");
const port = process.env.PORT || 8080;
console.log("smoke-fixture/monorepo ROOT app (rootDirectory NOT applied)");
http
  .createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("root");
  })
  .listen(port, () => console.log(`listening on ${port}`));
