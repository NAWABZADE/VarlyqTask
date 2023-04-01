
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const JWT_SECRET  = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded)
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Unauthorized' });
  }
};

module.exports = { authenticate };
