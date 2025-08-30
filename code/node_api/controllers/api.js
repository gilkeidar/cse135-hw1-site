//  Controller (of MVC)
//  Running on http://localhost:3001 and proxied by Apache to /api
const { createServer } = require('node:http');

const hostname = 'localhost';
const port = 3001;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World!</h1>');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});