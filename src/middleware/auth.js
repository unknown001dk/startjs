export function auth(options = {}) {
  return (req, res, next) => {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    req.user = { token: authorization.slice(7) };
    return next();
  };
}
