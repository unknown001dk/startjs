import { getModel } from './model.js';
import { compileSchema } from '../validation/compiler.js';
import { validate } from '../validation/validator.js';

export function generateCRUD(app, modelName) {
  const modelDef = getModel(modelName);
  if (!modelDef) {
    throw new Error(`Model ${modelName} not found`);
  }

  const validateSchema = compileSchema(modelDef.schema);
  const basePath = `/${modelName.toLowerCase()}s`;

  app.get(basePath, (req, res) => {
    res.success(modelDef.records);
  });

  app.get(`${basePath}/:id`, (req, res) => {
    const item = modelDef.records.find((item) => item.id === req.params.id);
    if (!item) return res.status(404).error('Not found');
    return res.success(item);
  });

  app.post(basePath, (req, res) => {
    const payload = req.body || {};
    const result = validate(validateSchema, payload);
    if (!result.valid) return res.status(400).json({ success: false, errors: result.errors });
    const record = { ...payload, id: String(Date.now()) };
    modelDef.records.push(record);
    return res.status(201).success(record);
  });

  app.put(`${basePath}/:id`, (req, res) => {
    const record = modelDef.records.find((item) => item.id === req.params.id);
    if (!record) return res.status(404).error('Not found');
    Object.assign(record, req.body || {});
    return res.success(record);
  });

  app.delete(`${basePath}/:id`, (req, res) => {
    const index = modelDef.records.findIndex((item) => item.id === req.params.id);
    if (index === -1) return res.status(404).error('Not found');
    modelDef.records.splice(index, 1);
    return res.success({ id: req.params.id });
  });
}
