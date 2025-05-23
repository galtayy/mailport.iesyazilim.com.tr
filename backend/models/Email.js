const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'message_id'
  },
  dateReceived: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'date_received'
  },
  senderEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'sender_email'
  },
  senderName: {
    type: DataTypes.STRING(255),
    field: 'sender_name'
  },
  companyName: {
    type: DataTypes.STRING(255),
    field: 'company_name'
  },
  subject: {
    type: DataTypes.TEXT
  },
  content: {
    type: DataTypes.TEXT('long')
  },
  htmlContent: {
    type: DataTypes.TEXT('long'),
    field: 'html_content'
  },
  hasAttachments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_attachments'
  },
  isCompanyNameManual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_company_name_manual'
  },
  isSenderNameManual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_sender_name_manual'
  },
  status: {
    type: DataTypes.ENUM('unread', 'read', 'forwarded', 'replied'),
    defaultValue: 'unread'
  },
  readByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'read_by_user_id'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  lastActionUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'last_action_user_id'
  },
  lastActionAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_action_at'
  },
  conversationId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'conversation_id'
  },
  threadSubject: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thread_subject'
  },
  isConversationRoot: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_conversation_root'
  }
}, {
  tableName: 'emails',
  indexes: [
    { fields: ['date_received'] },
    { fields: ['sender_email'] },
    { fields: ['company_name'] },
    { fields: ['status'] },
    { fields: ['conversation_id'] },
    { fields: ['is_conversation_root'] }
  ]
});

module.exports = Email;