const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User } = require('./database/models');

// ...

const app = express();

app.use(express.json());

// ...

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Some required fields are missing' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: 'Invalid fields' });
  }

  const jwtConfig = { expiresIn: '7d', algorithm: 'HS256' };

  const token = jwt.sign({ data: user }, process.env.JWT_SECRET, jwtConfig);
  res.status(200).json({ token });
});

// É importante exportar a constante `app`,
// para que possa ser utilizada pelo arquivo `src/server.js`
module.exports = app;
