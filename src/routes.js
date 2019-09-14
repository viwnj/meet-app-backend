import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import AuthController from './app/controllers/AuthController';
import AuthMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizerController from './app/controllers/OrganizerController';
import SubscriberController from './app/controllers/SubscriberController';
import NotificationController from './app/controllers/NotificationController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.store);
routes.post('/auth', AuthController.store);

routes.use(AuthMiddleware);
routes.put('/user', UserController.update);
routes.get('/user', UserController.index);

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:meetupId', MeetupController.update);
routes.delete('/meetups/:meetupId', MeetupController.delete);

routes.get('/organized/meetups', OrganizerController.index);
routes.get('/subscribed/meetups', SubscriberController.index);

routes.post('/subscribe/:meetupId', SubscriptionController.store);
routes.delete('/subscribe/:meetupId', SubscriptionController.delete);

routes.get('/notifications', NotificationController.index);
// File related
routes.post('/avatar', upload.single('avatar'), FileController.create);
export default routes;
