'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tasks = await queryInterface.sequelize.query(
      'SELECT id FROM tasks ORDER BY created_at ASC LIMIT 3;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM users LIMIT 3;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tasks.length === 0 || users.length === 0) {
      console.log('Skip comments seeder: tasks or users not found');
      return;
    }

    const comments = [
      {
        id: uuidv4(),
        task_id: tasks[0].id,
        user_id: users[0].id,
        content: 'Boilerplate sudah jadi, tinggal tambah halaman baru.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        task_id: tasks[1].id,
        user_id: users[1].id,
        content: 'Saya sudah mulai bikin draft ERD, akan saya push besok.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        task_id: tasks[1].id,
        user_id: users[0].id,
        content: 'Baik, tolong attach file ERD di sini setelah selesai ya.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        task_id: tasks[2].id,
        user_id: users[2].id,
        content: 'Apakah endpoint produk perlu include search?',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('comments', comments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  },
};
