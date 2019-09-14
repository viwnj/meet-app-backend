import { format, parse } from 'date-fns';
import * as Yup from 'yup';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async store(req, res) {
    if (!req.params.meetupId)
      return res.status(400).json({ error: 'A meetupId param is required' });

    const meetup = await Meetup.findOne({
      where: { id: req.params.meetupId },
      attributes: ['id', 'title', 'location', 'date'],
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
      ],
    });

    // Check meetup exists
    if (!meetup) return res.status(404).json({ error: 'Meetup not found' });

    const isSubscriber = await Subscription.findOne({
      where: { subscriber_id: req.userId, meetup_id: meetup.id },
    });

    // Check whether user is a subscriber
    if (isSubscriber)
      return res
        .status(401)
        .json({ error: 'You are already a subscriber to this meetup' });

    // Check whether user is the organizer of the event
    if (meetup.organizer.id === req.userId) {
      return res.status(403).json({
        error: 'You cannot subscribe to a meetup where you are the organizer',
      });
    }

    // Check wheter user is trying to subscribe to events that occur in the same hour
    const isScheduled = await Subscription.findOne({
      where: {
        subscriber_id: req.userId,
      },
      attributes: ['id', 'subscriber_id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'date'],
          where: { date: meetup.date },
        },
      ],
    });

    if (isScheduled) {
      return res.status(401).json({
        error:
          'You cannot subscribe to 2 Meetups that occur on the same day and hour',
      });
    }

    const subscription = await Subscription.create({
      subscriber_id: req.userId,
      meetup_id: meetup.id,
    });

    const subscriber = await User.findByPk(req.userId);

    await Notification.create({
      content: `You have a new subscription from ${subscriber.name} for your ${meetup.title} event!`,
      user: meetup.organizer.id,
    });

    Queue.add(SubscriptionMail.key, { meetup, subscriber });
    return res.json(subscription);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      meetupId: Yup.number().required(),
    });

    try {
      await schema.validate(req.params);
    } catch ({ errors }) {
      return res.status(401).json({ errors });
    }

    if (!req.params.meetupId)
      return res.status(400).json({ error: 'A meetupId param is required' });

    const meetup = await Meetup.findByPk(req.params.meetupId);

    // Check the meetup exists
    if (!meetup) return res.status(404).json({ error: 'Meetup not found' });

    // Check user is a subscriber
    const subscription = await Subscription.findOne({
      where: { subscriber_id: req.userId, meetup_id: meetup.id },
    });

    if (!subscription) {
      return res
        .status(401)
        .json({ error: 'This user is not a subscriber to this meetup' });
    }

    // Delete the subscription
    await subscription.destroy();
    return res.json();
  }
}

export default new SubscriptionController();
