const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const authController = {
  async login(req, res) {
    try {
      const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const { username, password } = value;

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username }
          ],
          isActive: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
      }

      await user.update({ lastLogin: new Date() });

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Giriş başarılı',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login hatası:', error);
      res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      });
    } catch (error) {
      console.error('Profil hatası:', error);
      res.status(500).json({ error: 'Profil bilgileri alınırken hata oluştu' });
    }
  },

  async changePassword(req, res) {
    try {
      const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const { currentPassword, newPassword } = value;
      const user = await User.findByPk(req.user.userId);

      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Mevcut şifre hatalı' });
      }

      await user.update({ password: newPassword });

      res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      res.status(500).json({ error: 'Şifre değiştirilirken hata oluştu' });
    }
  },

  async createUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        fullName: Joi.string().min(2).max(100).required(),
        role: Joi.string().valid('admin', 'destek').default('destek')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: value.username },
            { email: value.email }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Kullanıcı adı veya e-posta zaten kullanımda' });
      }

      const user = await User.create(value);

      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      res.status(500).json({ error: 'Kullanıcı oluşturulurken hata oluştu' });
    }
  },

  async getUsers(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'fullName', 'role', 'isActive', 'lastLogin', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      res.json({ users });
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      res.status(500).json({ error: 'Kullanıcı listesi alınırken hata oluştu' });
    }
  },

  async updateUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const { id } = req.params;
      const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30),
        email: Joi.string().email(),
        password: Joi.string().min(6).allow(''),
        fullName: Joi.string().min(2).max(100),
        role: Joi.string().valid('admin', 'destek'),
        isActive: Joi.boolean()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Geçersiz veri', 
          details: error.details[0].message 
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Kendi hesabını silmesini engelle
      if (user.id === req.user.userId && value.isActive === false) {
        return res.status(400).json({ error: 'Kendi hesabınızı deaktif edemezsiniz' });
      }

      // Kullanıcı adı ve e-posta benzersizlik kontrolü
      if (value.username || value.email) {
        const existingUser = await User.findOne({
          where: {
            [Op.and]: [
              { id: { [Op.ne]: id } },
              {
                [Op.or]: [
                  ...(value.username ? [{ username: value.username }] : []),
                  ...(value.email ? [{ email: value.email }] : [])
                ]
              }
            ]
          }
        });

        if (existingUser) {
          return res.status(409).json({ error: 'Kullanıcı adı veya e-posta zaten kullanımda' });
        }
      }

      // Boş şifreyi güncelleme verilerinden çıkar
      if (value.password === '') {
        delete value.password;
      }

      await user.update(value);

      res.json({
        message: 'Kullanıcı başarıyla güncellendi',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
    }
  },

  async deleteUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
      }

      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Kendi hesabını silmesini engelle
      if (user.id === req.user.userId) {
        return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
      }

      await user.destroy();

      res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu' });
    }
  }
};

module.exports = authController;