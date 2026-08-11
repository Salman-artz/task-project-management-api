'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const workspaces = await queryInterface.sequelize.query(
      'SELECT id FROM workspaces LIMIT 1;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'owner@example.com' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (workspaces.length === 0 || users.length === 0) {
      console.log('Skip projects seeder: workspaces or users not found');
      return;
    }

    const workspaceId = workspaces[0].id;
    const userId = users[0].id;

    await queryInterface.bulkInsert('projects', [
      {
        id: uuidv4(),
        workspace_id: workspaceId,
        name: 'E-Commerce App',
        description: 'Membangun aplikasi e-commerce dengan React dan Node.js',
        status: 'active',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        workspace_id: workspaceId,
        name: 'Mobile App Redesign',
        description: 'Redesign UI/UX aplikasi mobile versi 2.0',
        status: 'active',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        workspace_id: workspaceId,
        name: 'Legacy System Migration',
        description: 'Migrasi sistem lama ke arsitektur microservices',
        status: 'completed',
        created_by: userId,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
  },
};

