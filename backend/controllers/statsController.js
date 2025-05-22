const { Email, ActionLog, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const statsController = {
  async getEmailStats(req, res) {
    try {
      // Genel e-posta istatistikleri
      const totalEmails = await Email.count();
      const unreadEmails = await Email.count({ where: { status: 'unread' } });
      const readEmails = await Email.count({ where: { status: 'read' } });
      const forwardedEmails = await Email.count({ where: { status: 'forwarded' } });
      const repliedEmails = await Email.count({ where: { status: 'replied' } });

      // Bu ay gelen e-postalar
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthEmails = await Email.count({
        where: {
          dateReceived: { [Op.gte]: thisMonth }
        }
      });

      // Bu hafta gelen e-postalar
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
      thisWeek.setHours(0, 0, 0, 0);

      const thisWeekEmails = await Email.count({
        where: {
          dateReceived: { [Op.gte]: thisWeek }
        }
      });

      // Bugün gelen e-postalar
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEmails = await Email.count({
        where: {
          dateReceived: { [Op.gte]: today }
        }
      });

      // En çok mail gönderen domainler
      const topDomains = await sequelize.query(`
        SELECT 
          SUBSTRING_INDEX(sender_email, '@', -1) as domain,
          COUNT(*) as count
        FROM emails 
        GROUP BY SUBSTRING_INDEX(sender_email, '@', -1)
        ORDER BY count DESC 
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT });

      // En çok mail gönderen firmalar
      const topCompanies = await Email.findAll({
        attributes: [
          'companyName',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          companyName: { [Op.ne]: null }
        },
        group: ['companyName'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Aylık e-posta dağılımı (son 12 ay)
      const monthlyStats = await sequelize.query(`
        SELECT 
          DATE_FORMAT(date_received, '%Y-%m') as month,
          COUNT(*) as count
        FROM emails 
        WHERE date_received >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(date_received, '%Y-%m')
        ORDER BY month ASC
      `, { type: sequelize.QueryTypes.SELECT });

      // Haftalık e-posta dağılımı (son 4 hafta)
      const weeklyStats = await sequelize.query(`
        SELECT 
          WEEK(date_received) as week,
          YEAR(date_received) as year,
          COUNT(*) as count
        FROM emails 
        WHERE date_received >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
        GROUP BY WEEK(date_received), YEAR(date_received)
        ORDER BY year ASC, week ASC
      `, { type: sequelize.QueryTypes.SELECT });

      res.json({
        general: {
          total: totalEmails,
          unread: unreadEmails,
          read: readEmails,
          forwarded: forwardedEmails,
          replied: repliedEmails
        },
        periods: {
          today: todayEmails,
          thisWeek: thisWeekEmails,
          thisMonth: thisMonthEmails
        },
        topDomains,
        topCompanies,
        monthly: monthlyStats,
        weekly: weeklyStats
      });
    } catch (error) {
      console.error('İstatistik hatası:', error);
      res.status(500).json({ error: 'İstatistikler alınırken hata oluştu' });
    }
  },

  async getActionStats(req, res) {
    try {
      // İşlem istatistikleri
      const totalActions = await ActionLog.count();
      const forwardActions = await ActionLog.count({ where: { actionType: 'forward' } });
      const replyActions = await ActionLog.count({ where: { actionType: 'reply' } });
      const editActions = await ActionLog.count({ 
        where: { 
          actionType: { [Op.in]: ['edit_company', 'edit_sender'] }
        }
      });

      // Son 30 günlük işlem dağılımı
      const dailyActions = await sequelize.query(`
        SELECT 
          DATE(created_at) as date,
          action_type,
          COUNT(*) as count
        FROM action_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at), action_type
        ORDER BY date ASC
      `, { type: sequelize.QueryTypes.SELECT });

      // En aktif kullanıcılar (IP bazında)
      const topUsers = await ActionLog.findAll({
        attributes: [
          'userIp',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          userIp: { [Op.ne]: null }
        },
        group: ['userIp'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      res.json({
        general: {
          total: totalActions,
          forwards: forwardActions,
          replies: replyActions,
          edits: editActions
        },
        daily: dailyActions,
        topUsers
      });
    } catch (error) {
      console.error('İşlem istatistik hatası:', error);
      res.status(500).json({ error: 'İşlem istatistikleri alınırken hata oluştu' });
    }
  },

  async getSystemStats(req, res) {
    try {
      // Sistem istatistikleri
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const adminUsers = await User.count({ where: { role: 'admin' } });
      const supportUsers = await User.count({ where: { role: 'destek' } });

      // Ek dosya istatistikleri
      const emailsWithAttachments = await Email.count({ where: { hasAttachments: true } });

      // Manuel düzenleme istatistikleri
      const manualCompanyNames = await Email.count({ where: { isCompanyNameManual: true } });
      const manualSenderNames = await Email.count({ where: { isSenderNameManual: true } });

      // Veritabanı boyutu (yaklaşık)
      const dbSize = await sequelize.query(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `, { type: sequelize.QueryTypes.SELECT });

      res.json({
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers,
          support: supportUsers
        },
        attachments: emailsWithAttachments,
        manualEdits: {
          companies: manualCompanyNames,
          senders: manualSenderNames
        },
        database: {
          sizeMB: dbSize[0]?.size_mb || 0
        }
      });
    } catch (error) {
      console.error('Sistem istatistik hatası:', error);
      res.status(500).json({ error: 'Sistem istatistikleri alınırken hata oluştu' });
    }
  }
};

module.exports = statsController;