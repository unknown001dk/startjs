const models = new Map();

export function model(name, schema) {
  models.set(name, { name, schema, records: [] });
  return models.get(name);
}

export function getModel(name) {
  return models.get(name);
}
