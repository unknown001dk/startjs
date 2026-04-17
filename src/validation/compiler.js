import { rules } from './rules.js';

export function compileSchema(schema) {
  const compiled = {};
  for (const field of Object.keys(schema)) {
    const ruleText = schema[field].split('|').map((item) => item.trim());
    compiled[field] = ruleText.map((token) => {
      const [name, arg] = token.split(':');
      const rule = rules[name];
      if (!rule) {
        throw new Error(`Unsupported validation rule: ${name}`);
      }
      return { validate: rule.validate, message: rule.message(arg), arg };
    });
  }
  return compiled;
}
