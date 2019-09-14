import * as Yup from 'yup';
import {
  isBefore,
  parseISO,
  isAfter,
  subHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async store(req, res) {
    const { date } = req.body;
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string()
        .required()
        .min(6),
      banner_id: Yup.number().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    try {
      await schema.validate(req.body);
    } catch ({ errors }) {
      return res.status(400).json(errors);
    }

    const parsedDate = parseISO(date);
    if (isBefore(parsedDate, Date.now())) {
      return res
        .status(401)
        .json({ error: 'You cannot create meetups on a past date.' });
    }

    const meetup = await Meetup.create({
      organizer_id: req.userId,
      ...req.body,
    });
    return res.json(meetup);
  }

  async index(req, res) {
    const { date, page = 1 } = req.query;
    const parsedDate = parseISO(date);
    const meetups = await Meetup.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'url', 'path'],
          },
        },
      ],
    });
    return res.json(meetups);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string().min(6),
      banner_id: Yup.number(),
      location: Yup.string(),
      date: Yup.date(),
    });

    // Request validation
    try {
      await schema.validate(req.body);
    } catch ({ errors }) {
      return res.status(400).json(errors);
    }

    const { meetupId } = req.params;
    const meetup = await Meetup.findOne({ where: { id: meetupId } });

    // Check meetup exists
    if (!meetup)
      return res
        .status(404)
        .json({ error: 'The meetup you are trying to edit does not exist' });

    // Check user is the organizer
    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You do not have permission to do that.' });
    }

    // Check date is valid
    if (req.body.date && isBefore(parseISO(req.body.date), Date.now())) {
      return res
        .status(401)
        .json({ error: 'Trying to reschedule a meetup to a past date' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const { meetupId } = req.params;
    const meetup = await Meetup.findByPk(meetupId);
    if (!meetup) {
      return res.status(400).json({ error: 'The meetup does not exist' });
    }

    // Check user is the organizer
    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You are not allowed cancel that meetup' });
    }

    if (meetup.canceled_at) {
      return res.status(401).json({ error: 'This meetup is already canceled' });
    }

    if (
      isBefore(subHours(meetup.date, 2), Date.now()) &&
      !isAfter(Date.now(), meetup.date)
    ) {
      return res
        .status(401)
        .json({ error: 'You cannot cancel a meetup 2 hours before it starts' });
    }

    if (isAfter(Date.now(), meetup.date)) {
      return res.status(401).json({
        error: 'You are not allowed to cancel meetups that already occurred',
      });
    }

    await meetup.update({ canceled_at: Date.now() });

    return res.json(meetup);
  }
}

export default new MeetupController();
