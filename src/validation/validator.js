export function validate(compiledSchema, payload) {
  const errors = [];

  for (const field of Object.keys(compiledSchema)) {
    const rules = compiledSchema[field];
    const value = payload[field];
    for (const rule of rules) {
      if (!rule.validate(value, rule.arg)) {
        errors.push(`${field} ${rule.message(rule.arg)}`);
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
