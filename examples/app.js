import { createApp, bodyParser, cors, logger } from '../src/index.js';
import { model, generateCRUD } from '../src/crud/index.js';

const app = createApp();

app.use(logger());
app.use(cors());
app.use(bodyParser());

app.get('/hello/:name', (req, res) => {
  res.success({ message: `Hello ${req.params.name}` });
});

model('User', {
  name: 'required|string',
  email: 'required|email',
});

generateCRUD(app, 'User');

app.listen(3000, () => {
  console.log('StartJS app running on http://localhost:3000');
});
