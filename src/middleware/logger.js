export function logger(options = {}) {
  const { level = "info" } = options;

  return (req, res, next) => {
    const start = Date.now();

    res.once("finish", () => {
      const elapsed = Date.now() - start;
      res.setHeader("X-Response-Time", `${elapsed}ms`);
      const log = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        url: req.url,
        status: res.statusCode,
        durationMs: elapsed,
        level,
      };
      console.log(JSON.stringify(log));
    });

    return next();
  };
}
