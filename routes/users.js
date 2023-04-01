const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const { authenticate } = require('../middlewares/auth');
// console.log("JWT_SECRET:", JWT_SECRET);


const router = express.Router();

// GET /users - get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

// POST /users - create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// DELETE /users/:id - delete a user by id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error();
    res.send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(404).send({ error: 'User not found' });
  }
});

// PUT /users/:id - update a user by id
router.put('/:id', authenticate ,async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(id, {
      name,
      email,
      mobile,
      password: hashedPassword,
    }, { new: true });
    if (!updatedUser) throw new Error();
    res.send(updatedUser);
  } catch (err) {
    res.status(404).send({ error: 'User not found' });
  }
});

// POST /users/login - authenticate a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ data:{user,token} });
  } catch (err) {
    res.status(401).send({ error: err.message });
  }
});

module.exports = router;
