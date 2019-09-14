import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  // create user
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
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

    const user_exists = await User.findOne({
      where: { email: req.body.email },
    });

    if (user_exists) {
      return res.status(400).json({ error: 'This email is already in use' });
    }

    const { id, name, email } = await User.create(req.body);
    return res.json({ id, name, email });
  }

  // update user
  async update(req, res) {
    const { userId } = req;
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      passwords: Yup.string().min(6),
      oldPassword: Yup.string().when('password', (password, field) =>
        password ? field.required() : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    try {
      await schema.validate(req.body);
    } catch ({ errors }) {
      return res.status(400).json(errors);
    }

    const user = await User.findByPk(userId);
    const { oldPassword } = req.body;
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    const { id, name, email } = await user.update(req.body);

    return res.json({ id, name, email });
  }

  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'url', 'path'] },
      ],
    });
    return res.json(users);
  }
}

export default new UserController();
