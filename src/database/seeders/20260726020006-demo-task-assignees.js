'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tasks = await queryInterface.sequelize.query(
      'SELECT id FROM tasks LIMIT 5;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 3;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tasks.length === 0 || users.length < 2) {
      console.log('Skip task_assignees seeder: tasks or users not found');
      return;
    }

    const assignees = [
      { id: uuidv4(), task_id: tasks[0].id, user_id: users[0].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[1].id, user_id: users[0].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[1].id, user_id: users[1].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[2].id, user_id: users[1].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[3].id, user_id: users[0].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[3].id, user_id: users[1].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[3].id, user_id: users[2].id, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), task_id: tasks[4].id, user_id: users[2].id, created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('task_assignees', assignees, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('task_assignees', null, {});
  },
};
