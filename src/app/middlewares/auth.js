import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async function AuthMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ error: 'Unauthorized' });

  const [, token] = authorization.split(' ');
  // verify token
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret, {
      expiresIn: authConfig.expires_in,
    });
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'JWT Token is not valid' });
  }
}
