import { StartApp } from './core/app.js';
import { createServer } from './core/server.js';
import * as coreMiddleware from './middleware/index.js';
import * as validation from './validation/index.js';
import * as crud from './crud/index.js';

export function createApp(options = {}) {
  const app = new StartApp(options);
  return app;
}

export { createServer, coreMiddleware, validation, crud };
export * from './middleware/index.js';
export * from './validation/index.js';
export * from './crud/index.js';
