import { randomUUID } from "crypto";

export class Request {
  constructor(raw) {
    this.raw = raw;
    this.method = raw.method || "GET";
    this.url = raw.url || "/";
    const parsed = new URL(this.url, "http://localhost");
    this.path = parsed.pathname || "/";
    this.search = parsed.search || "";
    this.headers = raw.headers || {};
    this.query = Object.fromEntries(parsed.searchParams.entries());
    this.params = {};
    this.body = null;
    this.id = this.headers["x-request-id"] || randomUUID();
  }
}
