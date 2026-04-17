import { security } from "../middleware/security.js";

export function securityPlugin(options = {}) {
  return {
    name: "security",
    init(app) {
      app.use(security(options));
      app.set("security", { enabled: true, options });
    },
  };
}

export function metricsPlugin(options = {}) {
  const store = {
    totalRequests: 0,
    totalErrors: 0,
    routeCounts: new Map(),
    averageDuration: 0,
  };

  return {
    name: "metrics",
    init(app) {
      app.provide("metrics", store);
      app.use((req, res, next) => {
        const start = Date.now();
        res.once("finish", () => {
          const elapsed = Date.now() - start;
          store.totalRequests += 1;
          if (res.statusCode >= 500) {
            store.totalErrors += 1;
          }
          const routeKey = `${req.method} ${req.path}${req.search}`;
          store.routeCounts.set(
            routeKey,
            (store.routeCounts.get(routeKey) || 0) + 1,
          );
          store.averageDuration =
            (store.averageDuration * (store.totalRequests - 1) + elapsed) /
            store.totalRequests;
        });
        return next();
      });
    },
  };
}
