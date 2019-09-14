import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import auth_config from '../../config/auth';

class AuthController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    try {
      await schema.validate(req.body);
    } catch ({ errors }) {
      return res.status(400).json(errors);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    // if user exists we proceed to compare the password given
    const hash_matches = await user.checkPassword(password);
    if (!hash_matches) {
      return res.json({ error: 'Authentication error' });
    }

    // if password matches we proceed to genereate a signed token
    const token = jwt.sign({ id: user.id }, auth_config.secret, {
      expiresIn: auth_config.expires_in,
    });
    return res.json({ token });
  }
}

export default new AuthController();
