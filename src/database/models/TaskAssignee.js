'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskAssignee extends Model {
    static associate(models) {
      TaskAssignee.belongsTo(models.Task, {
        foreignKey: 'task_id',
        as: 'task',
      });
      TaskAssignee.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }

  TaskAssignee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      task_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'TaskAssignee',
      tableName: 'task_assignees',
      underscored: true,
    }
  );

  return TaskAssignee;
};

