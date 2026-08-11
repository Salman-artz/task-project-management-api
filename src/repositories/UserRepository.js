const db = require('../database/models');

class UserRepository {
  async findById(id) {
    return await db.User.findByPk(id);
  }

  async findByEmail(email) {
    return await db.User.findOne({ where: { email } });
  }

  async create(userData) {
    return await db.User.create(userData);
  }

  async update(user, updateData) {
    Object.assign(user, updateData);
    return await user.save();
  }
}

module.exports = new UserRepository();
