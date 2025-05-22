const sequelize = require('../config/database');
const Email = require('./Email');
const EmailAttachment = require('./EmailAttachment');
const ActionLog = require('./ActionLog');
const User = require('./User');

Email.hasMany(EmailAttachment, { foreignKey: 'emailId', as: 'attachments' });
EmailAttachment.belongsTo(Email, { foreignKey: 'emailId', as: 'email' });

Email.hasMany(ActionLog, { foreignKey: 'emailId', as: 'logs' });
ActionLog.belongsTo(Email, { foreignKey: 'emailId', as: 'email' });

Email.belongsTo(User, { foreignKey: 'readByUserId', as: 'readByUser' });
Email.belongsTo(User, { foreignKey: 'lastActionUserId', as: 'lastActionUser' });

ActionLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  Email,
  EmailAttachment,
  ActionLog,
  User
};