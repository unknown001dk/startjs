import http from "http";
import { Router } from "../router/router.js";
import { compose } from "../middleware/compose.js";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { HttpError } from "./error.js";
import { security } from "../middleware/security.js";

export class StartApp {
  constructor({ errorHandler } = {}) {
    this.router = new Router();
    this.globalMiddleware = [];
    this.plugins = new Map();
    this.providers = new Map();
    this.settings = new Map();
    this.settings.set("env", process.env.NODE_ENV || "development");
    this.settings.set("secureHeaders", true);
    this.errorHandler = errorHandler || this.defaultErrorHandler.bind(this);
    this.use(security());
  }

  set(name, value) {
    this.settings.set(name, value);
    return this;
  }

  get(name) {
    return this.settings.get(name);
  }

  get env() {
    return this.get("env");
  }

  get isProduction() {
    return this.env === "production";
  }

  use(...middlewares) {
    this.globalMiddleware.push(...middlewares.flat());
    return this;
  }

  error(handler) {
    this.errorHandler = handler;
    return this;
  }

  provide(name, value) {
    this.providers.set(name, value);
    return this;
  }

  getProvider(name) {
    return this.providers.get(name);
  }

  plugin(plugin, options = {}) {
    if (typeof plugin === "function") {
      plugin(this, options);
    } else if (plugin && typeof plugin.init === "function") {
      plugin.init(this, options);
    }

    if (plugin && plugin.name) {
      this.plugins.set(plugin.name, { plugin, options });
    }

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
