'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many workspaces (as owner)
      User.hasMany(models.Workspace, {
        foreignKey: 'owner_id',
        as: 'ownedWorkspaces',
      });
      // User belongs to many workspaces via WorkspaceMember
      User.belongsToMany(models.Workspace, {
        through: models.WorkspaceMember,
        foreignKey: 'user_id',
        otherKey: 'workspace_id',
        as: 'workspaces',
      });
      User.hasMany(models.WorkspaceMember, {
        foreignKey: 'user_id',
        as: 'memberships',
      });
      // User creates many projects
      User.hasMany(models.Project, {
        foreignKey: 'created_by',
        as: 'createdProjects',
      });
      // User creates many tasks
      User.hasMany(models.Task, {
        foreignKey: 'created_by',
        as: 'createdTasks',
      });
      // User assigned to many tasks
      User.belongsToMany(models.Task, {
        through: models.TaskAssignee,
        foreignKey: 'user_id',
        otherKey: 'task_id',
        as: 'assignedTasks',
      });
      // User comments on tasks
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments',
      });
      // User uploads attachments
      User.hasMany(models.Attachment, {
        foreignKey: 'uploaded_by',
        as: 'attachments',
      });
      // User activity logs
      User.hasMany(models.ActivityLog, {
        foreignKey: 'user_id',
        as: 'activityLogs',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  );

  return User;
};

