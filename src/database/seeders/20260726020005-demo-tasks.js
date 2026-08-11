'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const projects = await queryInterface.sequelize.query(
      'SELECT id, name FROM projects LIMIT 2;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const users = await queryInterface.sequelize.query(
      "SELECT id, email FROM users WHERE email = 'owner@example.com' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (projects.length === 0 || users.length === 0) {
      console.log('Skip tasks seeder: projects or users not found');
      return;
    }

    const userId = users[0].id;
    const tasks = [
      {
        id: uuidv4(),
        project_id: projects[0].id,
        title: 'Setup Next.js boilerplate',
        description: 'Inisialisasi project Next.js dengan TypeScript, Tailwind, dan konfigurasi ESLint',
        status: 'done',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        project_id: projects[0].id,
        title: 'Desain database schema',
        description: 'Buat ERD dan migration untuk tabel users, products, orders, dll.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        project_id: projects[0].id,
        title: 'Implementasi REST API produk',
        description: 'CRUD endpoint untuk manajemen produk dengan validasi dan pagination',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        project_id: projects[1].id,
        title: 'User research & analisis',
        description: 'Wawancara pengguna dan analisis pain points aplikasi saat ini',
        status: 'done',
        priority: 'high',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        created_by: userId,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        project_id: projects[1].id,
        title: 'Wireframe halaman utama',
        description: 'Buat wireframe low-fidelity untuk dashboard dan halaman profil',
        status: 'review',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        created_by: userId,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('tasks', tasks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', null, {});
  },
};
