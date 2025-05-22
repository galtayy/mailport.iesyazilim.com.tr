const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailAttachment = sequelize.define('EmailAttachment', {
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
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_filename'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    field: 'mime_type'
  }
}, {
  tableName: 'email_attachments',
  indexes: [
    { fields: ['email_id'] }
  ]
});

module.exports = EmailAttachment;