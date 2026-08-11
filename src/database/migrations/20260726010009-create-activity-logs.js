'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspaces',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      action: {
        type: Sequelize.ENUM(
          'create',
          'update',
          'delete',
          'assign',
          'unassign',
          'change_status',
          'change_role',
          'invite',
          'remove_member',
          'add_comment',
          'upload_file'
        ),
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('workspace', 'project', 'task', 'comment', 'attachment', 'member'),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('activity_logs', ['workspace_id'], {
      name: 'idx_activity_logs_workspace_id',
    });
    await queryInterface.addIndex('activity_logs', ['user_id'], {
      name: 'idx_activity_logs_user_id',
    });
    await queryInterface.addIndex('activity_logs', ['entity_type', 'entity_id'], {
      name: 'idx_activity_logs_entity',
    });
    await queryInterface.addIndex('activity_logs', ['action'], {
      name: 'idx_activity_logs_action',
    });
    await queryInterface.addIndex('activity_logs', ['created_at'], {
      name: 'idx_activity_logs_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_logs');
  },
};

