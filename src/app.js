import 'dotenv/config';
import express from 'express';
import { resolve } from 'path';
import Youch from 'youch';
import 'express-async-errors';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json({ errors });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    });
  }

  routes() {
    this.server.use(routes);
    this.exceptionHandler();
  }
}

export default new App().server;
