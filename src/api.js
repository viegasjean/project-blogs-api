const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User, Category, BlogPost, PostCategory } = require('./database/models');
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

app.get('/user', authenticate, async (_req, res) => {
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

app.get('/categories', authenticate, async (_req, res) => {
  const categories = await Category.findAll();
  return res.status(200).json(categories);
});

app.post('/post', authenticate, async (req, res) => {
  const { title, content, categoryIds, userId } = req.body;

  const POSTSCHEMA = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    categoryIds: Joi.array().required(),
  });

  const { error } = POSTSCHEMA.validate({ title, content, categoryIds });

  if (error) return res.status(400).json({ message: 'Some required fields are missing' });

  const category = await Category.findAll({ where: { id: categoryIds } });

  if (category.length === 0) return res.status(400).json({ message: '"categoryIds" not found' });

  const post = await BlogPost.create({ title, content, userId });

  const postCategory = categoryIds.map((categoryId) => ({ postId: post.id, categoryId }));

  await PostCategory.bulkCreate(postCategory);

  return res.status(201).json(post);
});

app.get('/post', authenticate, async (_req, res) => {
  const posts = await BlogPost.findAll({
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });
  res.status(200).json(posts);
});

app.get('/post/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const post = await BlogPost.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  if (!post) return res.status(404).json({ message: 'Post does not exist' });

  return res.status(200).json(post);
});

app.put('/post/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content, userId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Some required fields are missing' });
  }

  const authorized = await BlogPost.findOne({ where: { userId } });

  if (!authorized) return res.status(401).json({ message: 'Unauthorized user' });

  const update = await BlogPost.update(
    { title, content },
    { where: { id } },
  );

  const post = await BlogPost.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: { exclude: ['password'] } },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  return res.status(200).json(post);
});

// É importante exportar a constante `app`,
// para que possa ser utilizada pelo arquivo `src/server.js`
module.exports = app;
