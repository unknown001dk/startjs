# StartJS Framework

A lightweight Node.js HTTP framework inspired by the StartJS architecture document.

## Features

- Native HTTP server
- Global middleware pipeline
- Trie-based router with parameter extraction
- Validation engine with compile-time rules
- Simple CRUD generator scaffolding
- Custom request/response helpers

## Quick Start

```js
import { createApp, bodyParser, cors, logger } from './src/index.js';

const app = createApp();

app.use(logger());
app.use(cors());
app.use(bodyParser());

app.get('/hello/:name', (req, res) => {
  res.success({ message: `Hello ${req.params.name}` });
});

app.listen(3000, () => {
  console.log('StartJS app running on http://localhost:3000');
});
```
