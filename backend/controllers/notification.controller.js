import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: 'from',
      select: 'username profileImg',
    });

    await Notification.updateMany({ to: userId }, { $set: { read: true } });

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in getNotifications', error);
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: 'Notifications deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log('Error in deleteNotifications', error);
  }
};
