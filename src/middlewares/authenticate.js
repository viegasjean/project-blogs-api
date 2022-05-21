const jwt = require('jsonwebtoken');
// const { User } = require('../database/models');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const { authorization: token } = req.headers;

  if (!token) return res.status(401).json({ message: 'Token not found' });

  try {
    // const decoded =

    jwt.verify(token, process.env.JWT_SECRET);

    // const user = await User.findOne({ where: { username: decoded.data.username } });

    // if (!user) {
    //   return res
    //     .status(401)
    //     .json({ message: 'Erro ao procurar usuário do token.' });
    // }

    // req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Expired or invalid token' });
  }
};