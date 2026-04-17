export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizePath(pathname) {
  const normalized = pathname.replace(/\/+/g, "/").replace(/\/$/, "");
  return normalized || "/";
}

export function parseRoute(path) {
  const [pathnamePart, searchPart] = path.split("?");
  return {
    pathname: normalizePath(pathnamePart || "/"),
    search: searchPart ? `?${searchPart}` : null,
  };
}

function compileSegments(segments, isPrefix = false) {
  const keys = [];
  let regex = "^";
  let remainderIndex = null;

  if (!segments.length) {
    regex += "/";
  }

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];

    if (segment.startsWith("*")) {
      const key = segment.slice(1) || "wildcard";
      keys.push(key);
      regex += "/(.*)";
      break;
    }

    if (segment.startsWith(":")) {
      const match = segment.match(/^:([^()]+)(?:\((.+)\))?$/);
      const name = match?.[1] || segment.slice(1);
      const pattern = match?.[2] || "[^/]+";
      keys.push(name);
      regex += `/((${pattern}))`;
      continue;
    }

    regex += `/${escapeRegExp(segment)}`;
  }

  if (isPrefix) {
    remainderIndex = keys.length + 1;
    regex += "(?:/(.*))?";
  }

  regex += "/?$";
  return { regex: new RegExp(regex), keys, remainderIndex };
}

export function compileRoute(path) {
  const { pathname, search } = parseRoute(path);
  const segments = pathname.split("/").filter(Boolean);
  const { regex, keys } = compileSegments(segments);
  return { pathname, search, regex, keys };
}

export function compilePrefix(path) {
  const { pathname, search } = parseRoute(path);
  const segments = pathname.split("/").filter(Boolean);
  const { regex, keys, remainderIndex } = compileSegments(segments, true);
  return { pathname, search, regex, keys, remainderIndex };
}
