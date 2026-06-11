// Smoke fixture: crashes immediately on boot (never becomes healthy) so the
// deploy ends FAILED/CRASHED — exercises runtime-failure surfacing.
console.log("smoke-fixture/crash-on-boot booting — exiting non-zero");
console.error("intentional crash on boot");
process.exit(1);
