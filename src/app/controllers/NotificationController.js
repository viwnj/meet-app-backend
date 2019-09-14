import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    return res.json(notifications);
  }
}

export default new NotificationController();
