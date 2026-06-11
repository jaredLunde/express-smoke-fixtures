// Smoke fixture: calls another service over the private network and logs the
// result, proving private DNS resolution + routing. Also serves so it stays
// healthy. TARGET is the target's <name>.railway.internal host.
const http = require("http");
const port = process.env.PORT || 8080;
const target = process.env.TARGET || "";

console.log(`smoke-fixture/internal-caller booting; TARGET=${target}`);

function probe() {
  if (!target) {
    console.log("privnet: no TARGET set");
    return;
  }
  const url = target.startsWith("http") ? target : `http://${target}:8080/`;
  const req = http.get(url, res => {
    console.log(`privnet: reached ${target} status=${res.statusCode}`);
    res.resume();
  });
  req.on("error", e => console.log(`privnet: failed ${target} ${e.message}`));
  req.setTimeout(5000, () => {
    req.destroy();
    console.log(`privnet: timeout ${target}`);
  });
}

http
  .createServer((_, res) => {
    res.writeHead(200);
    res.end("caller ok");
  })
  .listen(port, () => {
    console.log(`listening on ${port}`);
    // Retry — the target may still be coming up when we boot.
    let n = 0;
    const t = setInterval(() => {
      probe();
      if (++n >= 5) clearInterval(t);
    }, 5000);
  });
