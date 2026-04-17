export class TrieNode {
  constructor(segment = "") {
    this.segment = segment;
    this.children = new Map();
    this.routes = [];
    this.isParam = segment.startsWith(":");
    this.paramName = this.isParam ? segment.slice(1) : null;
  }

  getChild(segment) {
    return this.children.get(segment) || this.children.get("*") || null;
  }
}

export class TrieRouter {
  constructor() {
    this.trees = new Map();
  }

  register(method, path, handlers) {
    const root = this.trees.get(method) || new TrieNode("");
    this.trees.set(method, root);

    const { pathname, search } = this.parseRoute(path);
    const segments = this.normalize(pathname).split("/").filter(Boolean);
    let current = root;

    for (const segment of segments) {
      const key = segment.startsWith(":") ? "*" : segment;
      if (!current.children.has(key)) {
        current.children.set(key, new TrieNode(segment));
      }
      current = current.children.get(key);
    }

    current.routes.push({ search, handlers });
  }

  match(method, path) {
    const root = this.trees.get(method);
    if (!root) return null;

    const { pathname, search } = this.parseRoute(path);
    const segments = this.normalize(pathname).split("/").filter(Boolean);
    const params = {};
    let current = root;

    for (const segment of segments) {
      const next = current.children.get(segment) || current.children.get("*");
      if (!next) {
        return null;
      }
      if (next.isParam) {
        params[next.paramName] = decodeURIComponent(segment);
      }
      current = next;
    }

    if (!current.routes.length) return null;

    const route = current.routes.find((route) => route.search === search);
    if (!route) return null;

    return { handlers: route.handlers, params, route: path };
  }

  parseRoute(path) {
    const parsed = new URL(path, "http://localhost");
    return { pathname: parsed.pathname, search: parsed.search };
  }

  normalize(path) {
    return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }
}
