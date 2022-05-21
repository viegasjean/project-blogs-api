const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User, Category } = require('./database/models');
const authenticate = require('./middlewares/authenticate');

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

app.post('/user', async (req, res) => {
  const { displayName, email, password, image } = req.body;

  const USERSCHEMA = Joi.object({
    displayName: Joi.string().min(8),
    email: Joi.string().email(),
    password: Joi.string().min(6),
  });

  const { error } = USERSCHEMA.validate({ displayName, email, password });

  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ where: { email } });

  if (user) return res.status(409).json({ message: 'User already registered' });

  const jwtConfig = { expiresIn: '7d', algorithm: 'HS256' };
  const token = jwt.sign({ data: user }, process.env.JWT_SECRET, jwtConfig);

  await User.create({ displayName, email, password, image });

  return res.status(201).json({ token });
});

app.get('/user', authenticate, async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
  });

  return res.status(200).json(users);
});

app.get('/user/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
   });

  if (!user) return res.status(404).json({ message: 'User does not exist' });

  return res.status(200).json(user);
});

app.post('/categories', authenticate, async (req, res) => {
  const { name } = req.body;
  const { id } = await Category.create(name);

  const CATEGORYSCHEMA = Joi.object({ name: Joi.string().required() });

  const { error } = CATEGORYSCHEMA.validate({ name });

  if (error) return res.status(400).json({ message: error.message });

  return res.status(201).json({ id, name });
});

// É importante exportar a constante `app`,
// para que possa ser utilizada pelo arquivo `src/server.js`
module.exports = app;
