import http from "http";
import { Router } from "../router/router.js";
import { compose } from "../middleware/compose.js";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { HttpError } from "./error.js";

export class StartApp {
  constructor({ errorHandler } = {}) {
    this.router = new Router();
    this.globalMiddleware = [];
    this.errorHandler = errorHandler || this.defaultErrorHandler.bind(this);
  }

  use(...middlewares) {
    this.globalMiddleware.push(...middlewares);
    return this;
  }

  route(method, path, ...handlers) {
    this.router.register(method.toUpperCase(), path, handlers);
    return this;
  }

  get(path, ...handlers) {
    return this.route("GET", path, ...handlers);
  }

  post(path, ...handlers) {
    return this.route("POST", path, ...handlers);
  }

  put(path, ...handlers) {
    return this.route("PUT", path, ...handlers);
  }

  delete(path, ...handlers) {
    return this.route("DELETE", path, ...handlers);
  }

  listen(port, callback) {
    const server = http.createServer(this.handleRequest.bind(this));
    return server.listen(port, callback);
  }

  async handleRequest(rawReq, rawRes) {
    const req = new Request(rawReq);
    const res = new Response(rawRes);
    const route = this.router.match(req.method, req.url);

    req.params = route?.params || {};
    req.route = route?.route || null;

    if (!route) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }

    const handlers = [...this.globalMiddleware, ...(route.handlers || [])];
    const fn = compose(handlers);

    try {
      await fn(req, res);
    } catch (error) {
      await this.errorHandler(error, req, res);
    }
  }

  async defaultErrorHandler(error, req, res) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ success: false, error: message });
  }
}
