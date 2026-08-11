'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.Workspace, {
        foreignKey: 'workspace_id',
        as: 'workspace',
      });
      Project.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
      });
      Project.hasMany(models.Task, {
        foreignKey: 'project_id',
        as: 'tasks',
      });
    }
  }

  Project.init(
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
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'archived', 'completed'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Project',
      tableName: 'projects',
      underscored: true,
    }
  );

  return Project;
};

