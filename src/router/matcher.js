export function parsePath(path) {
  return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

export function splitPath(path) {
  return parsePath(path).split("/").filter(Boolean);
}
