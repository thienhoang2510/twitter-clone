import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in getUserProfile', error.message);
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: 'You cannot follow/unfollow yourself' });
    }
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // unfollow user
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      // follow user
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      // send notification to userToFollow
      const newNotification = new Notification({
        from: req.user._id,
        to: userToFollow._id,
        type: 'follow',
      });
      await newNotification.save();
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in followUnfollowUser', error.message);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowed = await User.findById(userId).select('following');
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter(
      user => !usersFollowed.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach(user => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in getSuggestedUsers', error.message);
  }
};
