import React, { useState, useEffect } from 'react';
import { FaCog, FaEnvelope, FaServer, FaDatabase, FaSync, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import authService from '../services/authService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [testEmailForm, setTestEmailForm] = useState({
    to: '',
    subject: 'MailPort Test E-postası',
    content: 'Bu bir test e-postasıdır. SMTP ayarları doğru şekilde yapılandırılmıştır.'
  });
  const [cleanupForm, setCleanupForm] = useState({
    olderThanDays: 90,
    deleteAttachments: true
  });

  const isAdmin = authService.isAdmin();

  const fetchEmailSettings = async () => {
    try {
      const response = await api.get('/settings/email');
      setEmailSettings(response.data.settings);
    } catch (error) {
      console.error('E-posta ayarları hatası:', error);
      toast.error('E-posta ayarları yüklenirken hata oluştu');
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await api.get('/settings/system');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Sistem bilgileri hatası:', error);
      toast.error('Sistem bilgileri yüklenirken hata oluştu');
    }
  };

  const handleEmailSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Bu işlem için admin yetkisi gerekli');
      return;
    }

    try {
      setLoading(true);
      await api.put('/settings/email', emailSettings);
      toast.success('E-posta ayarları güncellendi');
    } catch (error) {
      console.error('E-posta ayarları güncelleme hatası:', error);
      toast.error(error.response?.data?.error || 'E-posta ayarları güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Bu işlem için admin yetkisi gerekli');
      return;
    }

    try {
      setLoading(true);
      await api.post('/settings/test-email', testEmailForm);
      toast.success('Test e-postası gönderildi');
    } catch (error) {
      console.error('Test e-posta hatası:', error);
      toast.error(error.response?.data?.error || 'Test e-postası gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDatabase = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Bu işlem için admin yetkisi gerekli');
      return;
    }

    if (!window.confirm(`${cleanupForm.olderThanDays} günden eski e-postaları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/settings/cleanup', cleanupForm);
      toast.success(`Temizleme tamamlandı: ${response.data.deleted.emails} e-posta, ${response.data.deleted.files} dosya silindi`);
      await fetchSystemInfo(); // Sistem bilgilerini yenile
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error);
      toast.error(error.response?.data?.error || 'Veritabanı temizlenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}g ${hours}s ${minutes}d`;
  };

  useEffect(() => {
    fetchEmailSettings();
    fetchSystemInfo();
  }, []);

  const tabs = [
    { id: 'email', name: 'E-posta Ayarları', icon: FaEnvelope },
    { id: 'system', name: 'Sistem Bilgileri', icon: FaServer },
    ...(isAdmin ? [{ id: 'maintenance', name: 'Bakım', icon: FaDatabase }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCog className="mr-3 text-primary-600" />
            Ayarlar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem ayarları ve yapılandırma
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">E-posta Yapılandırması</h3>
              
              <form onSubmit={handleEmailSettingsSubmit} className="space-y-6">
                {/* SMTP Ayarları */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">SMTP Ayarları (Giden E-posta)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                        className="input"
                        placeholder="smtp.gmail.com"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                        className="input"
                        placeholder="587"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMTP Kullanıcı</label>
                      <input
                        type="email"
                        value={emailSettings.smtpUser || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                        className="input"
                        placeholder="user@gmail.com"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMTP Şifre</label>
                      <input
                        type="password"
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                        className="input"
                        placeholder="Şifre değiştirmek için yazın"
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailSettings.smtpSecure || false}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpSecure: e.target.checked})}
                        className="mr-2"
                        disabled={!isAdmin}
                      />
                      <span className="text-sm text-gray-700">SSL/TLS Kullan</span>
                    </label>
                  </div>
                </div>

                {/* IMAP Ayarları */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">IMAP Ayarları (Gelen E-posta)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMAP Host</label>
                      <input
                        type="text"
                        value={emailSettings.imapHost || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, imapHost: e.target.value})}
                        className="input"
                        placeholder="imap.gmail.com"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMAP Port</label>
                      <input
                        type="number"
                        value={emailSettings.imapPort || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, imapPort: e.target.value})}
                        className="input"
                        placeholder="993"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMAP Kullanıcı</label>
                      <input
                        type="email"
                        value={emailSettings.imapUser || ''}
                        onChange={(e) => setEmailSettings({...emailSettings, imapUser: e.target.value})}
                        className="input"
                        placeholder="user@gmail.com"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IMAP Şifre</label>
                      <input
                        type="password"
                        onChange={(e) => setEmailSettings({...emailSettings, imapPassword: e.target.value})}
                        className="input"
                        placeholder="Şifre değiştirmek için yazın"
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailSettings.imapTls !== false}
                        onChange={(e) => setEmailSettings({...emailSettings, imapTls: e.target.checked})}
                        className="mr-2"
                        disabled={!isAdmin}
                      />
                      <span className="text-sm text-gray-700">TLS Kullan</span>
                    </label>
                  </div>
                </div>

                {/* Diğer Ayarlar */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Genel Ayarlar</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Varsayılan İletme E-postası</label>
                    <input
                      type="email"
                      value={emailSettings.defaultForwardEmail || ''}
                      onChange={(e) => setEmailSettings({...emailSettings, defaultForwardEmail: e.target.value})}
                      className="input"
                      placeholder="forward@company.com"
                      disabled={!isAdmin}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      E-posta iletme sırasında alıcı belirtilmezse bu adres kullanılır
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        'Ayarları Kaydet'
                      )}
                    </button>
                  </div>
                )}
              </form>

              {/* Test E-posta */}
              {isAdmin && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Test E-postası Gönder</h4>
                  <form onSubmit={handleSendTestEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alıcı</label>
                      <input
                        type="email"
                        value={testEmailForm.to}
                        onChange={(e) => setTestEmailForm({...testEmailForm, to: e.target.value})}
                        className="input"
                        placeholder="test@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Konu</label>
                      <input
                        type="text"
                        value={testEmailForm.subject}
                        onChange={(e) => setTestEmailForm({...testEmailForm, subject: e.target.value})}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">İçerik</label>
                      <textarea
                        value={testEmailForm.content}
                        onChange={(e) => setTestEmailForm({...testEmailForm, content: e.target.value})}
                        className="input"
                        rows={4}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      <FaPaperPlane className="mr-2 h-4 w-4" />
                      Test E-postası Gönder
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sistem Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sunucu Bilgileri */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Sunucu</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Node.js Sürümü</dt>
                      <dd className="text-sm text-gray-900">{systemInfo.system?.nodeVersion}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Platform</dt>
                      <dd className="text-sm text-gray-900">{systemInfo.system?.platform} ({systemInfo.system?.arch})</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Çalışma Süresi</dt>
                      <dd className="text-sm text-gray-900">
                        {systemInfo.system?.uptime ? formatUptime(systemInfo.system.uptime) : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bellek Kullanımı</dt>
                      <dd className="text-sm text-gray-900">
                        {systemInfo.system?.memory?.used} MB / {systemInfo.system?.memory?.total} MB
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Veritabanı Bilgileri */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Veritabanı</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">MySQL Sürümü</dt>
                      <dd className="text-sm text-gray-900">{systemInfo.database?.version}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ek Dosya Sayısı</dt>
                      <dd className="text-sm text-gray-900">{systemInfo.uploads?.count || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ek Dosya Boyutu</dt>
                      <dd className="text-sm text-gray-900">{systemInfo.uploads?.sizeMB || 0} MB</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    fetchSystemInfo();
                    toast.success('Sistem bilgileri yenilendi');
                  }}
                  className="btn-outline flex items-center"
                >
                  <FaSync className="mr-2 h-4 w-4" />
                  Bilgileri Yenile
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && isAdmin && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sistem Bakımı</h3>
              
              {/* Veritabanı Temizleme */}
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Veritabanı Temizleme</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Eski e-postaları ve ek dosyaları silerek veritabanı boyutunu küçültebilirsiniz.
                </p>
                
                <form onSubmit={handleCleanupDatabase} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kaç günden eski e-postaları sil
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={cleanupForm.olderThanDays}
                      onChange={(e) => setCleanupForm({...cleanupForm, olderThanDays: parseInt(e.target.value)})}
                      className="input w-32"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {cleanupForm.olderThanDays} günden eski e-postalar silinecek
                    </p>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cleanupForm.deleteAttachments}
                        onChange={(e) => setCleanupForm({...cleanupForm, deleteAttachments: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Ek dosyaları da sil</span>
                    </label>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <FaTrash className="h-5 w-5 text-red-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Dikkat!</h3>
                        <p className="mt-1 text-sm text-red-700">
                          Bu işlem geri alınamaz. Silinen e-postalar ve ek dosyalar kalıcı olarak kaybolacaktır.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-danger flex items-center"
                  >
                    <FaTrash className="mr-2 h-4 w-4" />
                    {loading ? 'Temizleniyor...' : 'Veritabanını Temizle'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;