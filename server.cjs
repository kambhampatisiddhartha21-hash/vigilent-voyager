import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/location', (req, res) => {
  console.log('User location:', req.body);
  res.sendStatus(200);
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log('Sign-in:', email, password);
  res.json({ email, message: 'Sign-in successful' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
