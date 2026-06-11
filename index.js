// Smoke fixture: probes an outbound target and logs the result. Used to observe
// the egress firewall (blocked ports) and static-egress IP behaviorally.
//   NET_PROBE_TARGET = "host:port" (TCP) or "host:80" with NET_PROBE_HTTP=1 (HTTP GET)
const http = require("http");
const net = require("net");
const port = process.env.PORT || 8080;
const spec = process.env.NET_PROBE_TARGET || "";
const doHttp = process.env.NET_PROBE_HTTP === "1";

console.log(`smoke-fixture/net-probe booting; target=${spec} http=${doHttp}`);

function tcpProbe() {
  const [host, portStr] = spec.split(":");
  const p = Number(portStr || 80);
  const sock = net.connect({ host, port: p });
  sock.setTimeout(8000);
  sock.on("connect", () => {
    console.log(`netprobe: connected ${host}:${p}`);
    sock.destroy();
  });
  sock.on("timeout", () => {
    console.log(`netprobe: timeout ${host}:${p}`);
    sock.destroy();
  });
  sock.on("error", e => console.log(`netprobe: blocked ${host}:${p} ${e.code || e.message}`));
}

function httpProbe() {
  const host = spec.split(":")[0];
  http
    .get(`http://${host}/`, res => {
      let b = "";
      res.on("data", d => (b += d));
      res.on("end", () => console.log(`netprobe: egress ip ${b.trim()}`));
    })
    .on("error", e => console.log(`netprobe: http error ${e.message}`));
}

http
  .createServer((_, res) => {
    res.writeHead(200);
    res.end("netprobe ok");
  })
  .listen(port, () => {
    console.log(`listening on ${port}`);
    if (!spec) console.log("netprobe: no target");
    else if (doHttp) httpProbe();
    else tcpProbe();
  });
