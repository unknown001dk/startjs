export function logger() {
  return (req, res, next) => {
    const start = Date.now();
    res.once('finish', () => {
      const elapsed = Date.now() - start;
      console.log(`${req.method} ${req.url} ${res.statusCode} - ${elapsed}ms`);
    });
    return next();
  };
}