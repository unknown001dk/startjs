import { compileSchema } from "./compiler.js";
import { validate } from "./validator.js";
import { ValidationError } from "../core/error.js";

export function schema(schemaDefinition) {
  const compiled = compileSchema(schemaDefinition);

  return (req, res, next) => {
    const payload = req.body || {};
    const result = validate(compiled, payload);
    if (!result.valid) {
      return next(new ValidationError(result.errors));
    }
    req.validated = payload;
    return next();
  };
}
