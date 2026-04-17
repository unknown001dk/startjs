export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends HttpError {
  constructor(errors) {
    super(400, Array.isArray(errors) ? errors.join("; ") : errors);
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
}
