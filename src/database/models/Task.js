'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Project, {
        foreignKey: 'project_id',
        as: 'project',
      });
      Task.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      // Task has many assignees (many-to-many with User)
      Task.belongsToMany(models.User, {
        through: models.TaskAssignee,
        foreignKey: 'task_id',
        otherKey: 'user_id',
        as: 'assignees',
      });
      Task.hasMany(models.TaskAssignee, {
        foreignKey: 'task_id',
        as: 'assigneeEntries',
      });
      // Task has many comments
      Task.hasMany(models.Comment, {
        foreignKey: 'task_id',
        as: 'comments',
      });
      // Task has many attachments
      Task.hasMany(models.Attachment, {
        foreignKey: 'task_id',
        as: 'attachments',
      });
    }
  }

  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done'),
        allowNull: false,
        defaultValue: 'todo',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks',
      underscored: true,
    }
  );

  return Task;
};

