
const express = require('express');
const { authenticate } = require('../middlewares/auth');
const Post = require('../models/post');
const User = require('../models/user');

const router = express.Router();

// get all posts------------------------------------------------------
router.get('/', authenticate, async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'name email');
    res.send(posts);
  } catch (err) {
    res.status(500).send({ error: 'Server error' });
  }
});

// create a new post--------------------------------------------------------------------
router.post('/', authenticate, async (req, res) => {
  try {
    const post = new Post({
      createdBy: req.user._id,
      message: req.body.message,
      comments: [{
        sentBy: req.user._id,
        sentAt: new Date(),
        liked: []
      }]
    });
    await post.save();
    res.send(post);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//  Delete Post----------------------------------------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) throw new Error();
    res.send({ message: 'post deleted successfully' });
  } catch (err) {
    res.status(404).send({ error: 'Post not found' });
  }
});
//  update post -------------------------------------------------------
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const post = await Post.findById(id);
    if (!post) throw new Error('Post not found');
    const comment = {
      sentBy: req.user._id,
      sentAt: new Date(),
      liked: []
    };
    post.comments.push(comment);
    post.message = message;
    await post.save();
    res.send(post);
  } catch (err) {
    res.status(404).send({ error: err.message });
  }
});


module.exports = router;