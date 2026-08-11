'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.Workspace, {
        foreignKey: 'workspace_id',
        as: 'workspace',
      });
      ActivityLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }

  ActivityLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.ENUM(
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
        type: DataTypes.ENUM('workspace', 'project', 'task', 'comment', 'attachment', 'member'),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ActivityLog',
      tableName: 'activity_logs',
      underscored: true,
    }
  );

  return ActivityLog;
};

