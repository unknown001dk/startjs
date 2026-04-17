import { compileRoute, compilePrefix, parseRoute } from "./trie.js";

export class Router {
  constructor() {
    this.routes = new Map();
    this.mounts = [];
  }

  register(method, path, handlers) {
    const route = compileRoute(path);
    route.handlers = handlers.flat();
    const routes = this.routes.get(method) || [];
    routes.push(route);
    this.routes.set(method, routes);
    return this;
  }

  get(path, ...handlers) {
    return this.register("GET", path, handlers);
  }

  post(path, ...handlers) {
    return this.register("POST", path, handlers);
  }

  put(path, ...handlers) {
    return this.register("PUT", path, handlers);
  }

  delete(path, ...handlers) {
    return this.register("DELETE", path, handlers);
  }

  use(path, routerOrMiddleware) {
    if (path instanceof Router && !routerOrMiddleware) {
      this.mounts.push({ route: compilePrefix("/"), router: path });
      return this;
    }

    if (typeof path === "string" && routerOrMiddleware instanceof Router) {
      const route = compilePrefix(path);
      this.mounts.push({ route, router: routerOrMiddleware });
      return this;
    }

    if (typeof path === "function") {
      const route = compilePrefix("/");
      this.mounts.push({ route, middleware: path });
      return this;
    }

    if (typeof path === "string" && typeof routerOrMiddleware === "function") {
      const route = compilePrefix(path);
      this.mounts.push({ route, middleware: routerOrMiddleware });
      return this;
    }

    throw new Error("Router.use expects a Router or middleware function");
  }

  group(prefix, callback) {
    const child = new Router();
    callback(child);
    this.use(prefix, child);
    return child;
  }

  match(method, path) {
    const { pathname, search } = parseRoute(path);
    const requestPath = normalizePath(pathname);
    const routes = this.routes.get(method) || [];
    const applicableMiddlewares = this.mounts
      .filter(
        (mount) => mount.middleware && mount.route.regex.test(requestPath),
      )
      .map((mount) => mount.middleware);

    const matchedRoute = routes.find((route) => {
      const result = route.regex.exec(requestPath);
      return result && (!route.search || route.search === search);
    });

    if (matchedRoute) {
      const result = matchedRoute.regex.exec(requestPath);
      const params = {};
      matchedRoute.keys.forEach((key, index) => {
        params[key] = result[index + 1]
          ? decodeURIComponent(result[index + 1])
          : undefined;
      });

      return {
        handlers: [...applicableMiddlewares, ...matchedRoute.handlers],
        params,
        route: matchedRoute.pathname,
      };
    }

    for (const mount of this.mounts.filter((mount) => mount.router)) {
      const result = mount.route.regex.exec(requestPath);
      if (!result) continue;

      const remainder = mount.route.remainderIndex
        ? result[mount.route.remainderIndex]
        : result[1];
      const childPath = remainder ? `/${remainder}` : "/";
      const childUrl = `${childPath}${search || ""}`;
      const childRoute = mount.router.match(method, childUrl);
      if (!childRoute) continue;

      const params = {};
      mount.route.keys.forEach((key, index) => {
        params[key] = result[index + 1]
          ? decodeURIComponent(result[index + 1])
          : undefined;
      });

      return {
        handlers: [
          ...applicableMiddlewares,
          ...(mount.middleware ? [mount.middleware] : []),
          ...childRoute.handlers,
        ],
        params: { ...params, ...childRoute.params },
        route: `${mount.route.pathname}${childRoute.route}`,
      };
    }

    return null;
  }
}

function normalizePath(pathname) {
  return pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}
