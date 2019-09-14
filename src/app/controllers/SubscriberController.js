import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

class SubscriberController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      attributes: ['id'],
      where: { subscriber_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'description', 'date'],
          where: { date: { [Op.gt]: new Date() } },
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      order: [['meetup', 'date', 'asc']],
    });

    return res.json(subscriptions);
  }
}

export default new SubscriberController();
