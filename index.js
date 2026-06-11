// Never reached — the build fails first (see package.json "build").
const http = require("http");
http.createServer((_, res) => res.end("unreachable")).listen(process.env.PORT || 8080);
