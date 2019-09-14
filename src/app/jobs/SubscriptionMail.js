import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, subscriber } = data;
    await Mail.sendMail({
      to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
      subject: `You have a new subscription from ${subscriber.name}!`,
      template: 'subscription',
      context: {
        name: meetup.organizer.name,
        subscriberName: subscriber.name,
        title: meetup.title,
        location: meetup.location,
        date: format(new Date(meetup.date), "MMMM',' do yyyy 'at' HH:mm aa"),
      },
    });
  }
}

export default new SubscriptionMail();
