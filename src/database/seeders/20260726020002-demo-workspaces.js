'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil user yang sudah di-seed — gunakan QueryTypes.SELECT
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('owner@example.com', 'admin@example.com', 'member@example.com', 'viewer@example.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.error('No users found. Run users seeder first.');
      return;
    }

    // Cari owner (prioritas owner@example.com, fallback ke yang pertama)
    const ownerUser = users.find((u) => u.email === 'owner@example.com') || users[0];
    const workspaceId = uuidv4();

    // Create workspace
    await queryInterface.bulkInsert('workspaces', [
      {
        id: workspaceId,
        name: 'Tim Pengembangan Portofolio',
        description: 'Workspace untuk mengerjakan project portofolio tim kecil',
        owner_id: ownerUser.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create workspace members
    const members = users.map((user) => {
      let role = 'member';
      if (user.email === 'owner@example.com') role = 'owner';
      if (user.email === 'admin@example.com') role = 'admin';
      if (user.email === 'viewer@example.com') role = 'viewer';

      return {
        id: uuidv4(),
        workspace_id: workspaceId,
        user_id: user.id,
        role: role,
        invited_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await queryInterface.bulkInsert('workspace_members', members, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workspace_members', null, {});
    await queryInterface.bulkDelete('workspaces', null, {});
  },
};
