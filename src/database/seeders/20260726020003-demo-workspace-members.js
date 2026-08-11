'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Workspace members sudah dibuat oleh seeder workspaces (20260726020002)
    // Seeder ini hanya placeholder untuk menjaga urutan
    console.log('Workspace members already seeded via workspace seeder. Skipping.');
  },

  async down(queryInterface, Sequelize) {
    // Jangan hapus — biarkan workspace seeder yang handle
  },
};

