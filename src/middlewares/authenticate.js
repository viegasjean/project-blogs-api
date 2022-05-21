const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const { authorization: token } = req.headers;

  if (!token) return res.status(401).json({ message: 'Token not found' });

  try {
    const { data: { id } } = jwt.verify(token, process.env.JWT_SECRET);

    req.body.userId = id;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Expired or invalid token' });
  }
};