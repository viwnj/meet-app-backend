import File from '../models/File';
// import User from '../models/User0';

class FileController {
  async create(req, res) {
    const { originalname: name, filename: path } = req.file;
    const file = await File.create({ name, path });
    // const user = await User.findByPk(req.userId);
    // await user.update({ avatar_id: file.id });

    return res.json(file);
  }
}

export default new FileController();
