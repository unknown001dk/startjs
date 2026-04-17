export function bodyParser() {
  return async (req, res, next) => {
    if (req.method === 'GET' || req.headers['content-length'] === '0') {
      return next();
    }

    const contentType = req.headers['content-type'] || '';
    const chunks = [];

    for await (const chunk of req.raw) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString();
    req.body = rawBody;

    if (contentType.includes('application/json')) {
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch (err) {
        return res.status(400).json({ success: false, error: 'Invalid JSON body' });
      }
    }

    return next();
  };
}
