import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    this.init();
  }

  init() {
    this.transporter = nodemailer.createTransport(mailConfig);
    this.configureMailTemplate();
  }

  configureMailTemplate() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');
    const viewEngine = exphbs.create({
      layoutsDir: resolve(viewPath, 'layouts'),
      partialsDir: resolve(viewPath, 'partials'),
      defaultLayout: 'default',
      extname: '.hbs',
    });

    this.transporter.use(
      'compile',
      nodemailerhbs({ viewEngine, viewPath, extName: '.hbs' })
    );
  }

  async sendMail(message) {
    await this.transporter.sendMail({
      from: 'Meetapp Staff <meetapp@noreply.com>',
      ...message,
    });
  }
}

export default new Mail();
