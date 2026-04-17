import http from 'http';

export function createServer(app, options = {}) {
  const server = http.createServer(app.handleRequest.bind(app));
  return server;
}
