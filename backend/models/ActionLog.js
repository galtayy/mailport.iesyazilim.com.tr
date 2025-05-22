const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActionLog = sequelize.define('ActionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  emailId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'email_id',
    references: {
      model: 'emails',
      key: 'id'
    }
  },
  actionType: {
    type: DataTypes.ENUM('forward', 'reply', 'edit_company', 'edit_sender', 'mark_read'),
    allowNull: false,
    field: 'action_type'
  },
  oldValue: {
    type: DataTypes.TEXT,
    field: 'old_value'
  },
  newValue: {
    type: DataTypes.TEXT,
    field: 'new_value'
  },
  userIp: {
    type: DataTypes.STRING(45),
    field: 'user_ip'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'action_logs',
  indexes: [
    { fields: ['email_id'] },
    { fields: ['action_type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ActionLog;