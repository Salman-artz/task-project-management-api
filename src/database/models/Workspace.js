'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workspace extends Model {
    static associate(models) {
      // Workspace belongs to owner (User)
      Workspace.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner',
      });
      // Workspace has many members via WorkspaceMember
      Workspace.belongsToMany(models.User, {
        through: models.WorkspaceMember,
        foreignKey: 'workspace_id',
        otherKey: 'user_id',
        as: 'members',
      });
      Workspace.hasMany(models.WorkspaceMember, {
        foreignKey: 'workspace_id',
        as: 'memberEntries',
      });
      // Workspace has many projects
      Workspace.hasMany(models.Project, {
        foreignKey: 'workspace_id',
        as: 'projects',
      });
      // Workspace has many activity logs
      Workspace.hasMany(models.ActivityLog, {
        foreignKey: 'workspace_id',
        as: 'activityLogs',
      });
    }
  }

  Workspace.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Workspace',
      tableName: 'workspaces',
      underscored: true,
    }
  );

  return Workspace;
};

