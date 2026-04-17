const DEFAULT_LIMIT = 1024 * 1024 * 2;

function parseBody(raw, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;

    raw.on("data", (chunk) => {
      length += chunk.length;
      if (length > limit) {
        reject(new Error("Payload too large"));
        raw.destroy();
        return;
      }
      chunks.push(chunk);
    });

    raw.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    raw.on("error", reject);
  });
}

export function bodyParser({ limit = DEFAULT_LIMIT } = {}) {
  return async (req, res, next) => {
    const method = req.method.toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      req.body = req.body ?? {};
      return next();
    }

    if (req.body !== null) {
      return next();
    }

    const contentType = (req.headers["content-type"] || "").toLowerCase();
    let rawBody;

    try {
      rawBody = await parseBody(req.raw, limit);
    } catch (error) {
      return res.status(413).json({ success: false, error: error.message });
    }

    if (!rawBody) {
      req.body = {};
      return next();
    }

    if (contentType.includes("application/json")) {
      try {
        req.body = JSON.parse(rawBody);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid JSON body" });
      }
      return next();
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      req.body = Object.fromEntries(new URLSearchParams(rawBody).entries());
      return next();
    }

    req.body = rawBody;
    return next();
  };
}
