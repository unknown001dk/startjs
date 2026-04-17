export class Response {
  constructor(raw) {
    this.raw = raw;
  }

  get statusCode() {
    return this.raw.statusCode;
  }

  once(event, listener) {
    this.raw.once(event, listener);
    return this;
  }

  status(code) {
    this.raw.statusCode = code;
    return this;
  }

  setHeader(name, value) {
    this.raw.setHeader(name, value);
    return this;
  }

  json(data) {
    this.setHeader("Content-Type", "application/json");
    this.raw.end(JSON.stringify(data));
    return this;
  }

  success(data) {
    return this.status(200).json({ success: true, data });
  }

  error(message, status = 500) {
    return this.status(status).json({ success: false, error: message });
  }
}
