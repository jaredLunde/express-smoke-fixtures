// Smoke fixture: the PRE-DEPLOY command (run via deploy.preDeployCommand =
// "node migrate.js"). Stands in for a DB migration: it connects to a companion
// service over the private network (MIGRATE_TARGET=<companion>.railway.internal)
// and logs a marker. Reaching it proves the pre-deploy phase has private-network
// access (privnet + *.railway.internal DNS are up before the app starts), and a
// non-zero exit here must fail the whole deploy before any traffic shifts.
const http = require("http");
const target = process.env.MIGRATE_TARGET || "";

console.log(`predeploy: starting migration; MIGRATE_TARGET=${target}`);

if (!target) {
  console.log("predeploy: no MIGRATE_TARGET set — failing migration");
  process.exit(1);
}

const url = target.startsWith("http") ? target : `http://${target}:8080/`;
const req = http.get(url, res => {
  res.resume();
  if (res.statusCode && res.statusCode < 500) {
    console.log(`predeploy: reached ${target} status=${res.statusCode}`);
    console.log("predeploy: migration complete");
    process.exit(0);
  }
  console.log(`predeploy: bad status ${res.statusCode} from ${target}`);
  process.exit(1);
});
req.on("error", e => {
  console.log(`predeploy: failed to reach ${target}: ${e.message}`);
  process.exit(1);
});
req.setTimeout(10000, () => {
  req.destroy();
  console.log(`predeploy: timeout reaching ${target}`);
  process.exit(1);
});
