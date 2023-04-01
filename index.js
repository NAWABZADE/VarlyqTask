const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const app = express();
const { PORT, DB_URI, JWT_SECRET } = process.env;

mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

// Middleware to check user  authentication-----------------------------
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ error: 'Unauthorized ' });
  } else {
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      req.userId = decodedToken.userId;
      next();
    } catch (err) {
      res.status(401).send({ error: 'Unauthorized token not found' });
    }
  }
};
//  Start Point----------------------------------------------------------- 
app.use('/posts', authenticateUser, postsRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
