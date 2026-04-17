export const rules = {
  required: {
    validate: (value) => value !== undefined && value !== null && value !== '',
    message: () => 'is required',
  },
  string: {
    validate: (value) => typeof value === 'string',
    message: () => 'must be a string',
  },
  email: {
    validate: (value) => typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
    message: () => 'must be a valid email',
  },
};
