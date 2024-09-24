import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!text && !img) {
      return res.status(400).json({ error: 'Text or image is required' });
    }
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', newPost });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in post controller', error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to delete this post' });
    }
    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in post controller', error);
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      user: userId,
      text,
    };

    post.comments.push(newComment);
    await post.save();
    res.status(201).json({ message: 'Comment added successfully', post });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in post controller', error);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id.toString();

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      // Like the post
      post.likes.push(userId);
      await post.save();
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: 'like',
      });
      await notification.save();
      res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in post controller', error);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'comments.user',
        select: '-password',
      });
    if (posts.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in post controller', error);
  }
};
