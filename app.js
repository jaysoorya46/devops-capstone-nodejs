const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const startedAt = new Date();

app.disable('x-powered-by');
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DevOps Capstone</title>
<style>
body{font-family:Arial,sans-serif;margin:0;background:#101827;color:#f3f6fb;display:grid;min-height:100vh;place-items:center}
main{max-width:700px;padding:40px;border:1px solid #334155;border-radius:18px;background:#182337;box-shadow:0 15px 45px #0005}
h1{color:#7dd3fc}code{background:#0b1220;padding:4px 8px;border-radius:6px}.ok{color:#86efac}
</style></head>
<body><main><h1>DevOps Capstone App</h1>
<p class="ok">Application is running successfully.</p>
<p>Node.js + Express | Docker | Jenkins | AWS EC2</p>
<p>Health endpoint: <code>/health</code></p>
<p>Metrics endpoint: <code>/metrics</code></p>
<p>Host: <code>${os.hostname()}</code></p>
<p>Started: <code>${startedAt.toISOString()}</code></p>
</main></body></html>`);
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'devops-capstone-nodejs',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Small Prometheus-compatible metrics endpoint; avoids exposing sensitive data.
app.get('/metrics', (_req, res) => {
  const mem = process.memoryUsage();
  res.type('text/plain').send([
    '# HELP app_uptime_seconds Process uptime in seconds',
    '# TYPE app_uptime_seconds gauge',
    `app_uptime_seconds ${process.uptime()}`,
    '# HELP app_memory_rss_bytes Resident memory in bytes',
    '# TYPE app_memory_rss_bytes gauge',
    `app_memory_rss_bytes ${mem.rss}`,
    '# HELP app_memory_heap_used_bytes Used V8 heap in bytes',
    '# TYPE app_memory_heap_used_bytes gauge',
    `app_memory_heap_used_bytes ${mem.heapUsed}`,
    ''
  ].join('\n'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DevOps Capstone app listening on port ${PORT}`);
});
