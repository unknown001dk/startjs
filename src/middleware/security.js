export function security(options = {}) {
  const defaults = {
    contentSecurityPolicy: "default-src 'self'",
    referrerPolicy: 'no-referrer',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xDnsPrefetchControl: 'off',
    strictTransportSecurity: options.strictTransportSecurity || 'max-age=31536000; includeSubDomains',
  };

  return (req, res, next) => {
    res.setHeader('X-DNS-Prefetch-Control', defaults.xDnsPrefetchControl);
    res.setHeader('X-Frame-Options', defaults.xFrameOptions);
    res.setHeader('X-Content-Type-Options', defaults.xContentTypeOptions);
    res.setHeader('Referrer-Policy', defaults.referrerPolicy);
    if (req.raw.socket.encrypted || req.raw.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', defaults.strictTransportSecurity);
    }
    res.setHeader('Content-Security-Policy', defaults.contentSecurityPolicy);
    return next();
  };
}