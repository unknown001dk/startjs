export function cors(options = {}) {
  const defaults = {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    headers: 'Content-Type,Authorization',
  };
  const config = { ...defaults, ...options };

  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.origin);
    res.setHeader('Access-Control-Allow-Methods', config.methods);
    res.setHeader('Access-Control-Allow-Headers', config.headers);

    if (req.method === 'OPTIONS') {
      return res.writeHead(204).end();
    }

    return next();
  };
}
