import React, { useState, useEffect } from 'react';
import { FaChartBar, FaEnvelope, FaUsers, FaServer, FaSync, FaEye, FaReply, FaShare, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import moment from 'moment';

const Statistics = () => {
  const [stats, setStats] = useState({
    emails: null,
    actions: null,
    system: null
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [emailsRes, actionsRes, systemRes] = await Promise.all([
        api.get('/stats/emails'),
        api.get('/stats/actions'),
        api.get('/stats/system')
      ]);

      setStats({
        emails: emailsRes.data,
        actions: actionsRes.data,
        system: systemRes.data
      });
    } catch (error) {
      console.error('İstatistik hatası:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  const { emails, actions, system } = stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaChartBar className="mr-3 text-primary-600" />
            İstatistikler
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem performans ve kullanım istatistikleri
          </p>
        </div>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn-primary flex items-center"
        >
          <FaSync className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Genel E-posta İstatistikleri */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">E-posta İstatistikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={FaEnvelope}
            title="Toplam E-posta"
            value={emails?.general.total || 0}
            color="blue"
          />
          <StatCard
            icon={FaEye}
            title="Okunmamış"
            value={emails?.general.unread || 0}
            color="red"
          />
          <StatCard
            icon={FaEye}
            title="Okunmuş"
            value={emails?.general.read || 0}
            color="green"
          />
          <StatCard
            icon={FaShare}
            title="İletilmiş"
            value={emails?.general.forwarded || 0}
            color="purple"
          />
          <StatCard
            icon={FaReply}
            title="Yanıtlanmış"
            value={emails?.general.replied || 0}
            color="indigo"
          />
        </div>
      </div>

      {/* Dönemsel İstatistikler */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Dönemsel E-posta Sayıları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={FaEnvelope}
            title="Bugün"
            value={emails?.periods.today || 0}
            subtitle="Gelen e-posta"
            color="green"
          />
          <StatCard
            icon={FaEnvelope}
            title="Bu Hafta"
            value={emails?.periods.thisWeek || 0}
            subtitle="Gelen e-posta"
            color="blue"
          />
          <StatCard
            icon={FaEnvelope}
            title="Bu Ay"
            value={emails?.periods.thisMonth || 0}
            subtitle="Gelen e-posta"
            color="purple"
          />
        </div>
      </div>

      {/* Sistem İstatistikleri */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sistem İstatistikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FaUsers}
            title="Toplam Kullanıcı"
            value={system?.users.total || 0}
            subtitle={`${system?.users.active || 0} aktif`}
            color="blue"
          />
          <StatCard
            icon={FaUsers}
            title="Admin Kullanıcı"
            value={system?.users.admin || 0}
            color="red"
          />
          <StatCard
            icon={FaEdit}
            title="Manuel Düzenleme"
            value={(system?.manualEdits.companies || 0) + (system?.manualEdits.senders || 0)}
            subtitle="Firma + gönderen"
            color="yellow"
          />
          <StatCard
            icon={FaServer}
            title="Veritabanı Boyutu"
            value={`${system?.database.sizeMB || 0} MB`}
            color="gray"
          />
        </div>
      </div>

      {/* İşlem İstatistikleri */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Kullanıcı İşlemleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FaChartBar}
            title="Toplam İşlem"
            value={actions?.general.total || 0}
            color="blue"
          />
          <StatCard
            icon={FaShare}
            title="İletme"
            value={actions?.general.forwards || 0}
            color="green"
          />
          <StatCard
            icon={FaReply}
            title="Yanıtlama"
            value={actions?.general.replies || 0}
            color="purple"
          />
          <StatCard
            icon={FaEdit}
            title="Düzenleme"
            value={actions?.general.edits || 0}
            color="yellow"
          />
        </div>
      </div>

      {/* En Çok Mail Gönderen Domainler */}
      {emails?.topDomains && emails.topDomains.length > 0 && (
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">En Çok Mail Gönderen Domainler</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>E-posta Sayısı</th>
                    <th>Yüzde</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.topDomains.map((domain, index) => (
                    <tr key={index}>
                      <td className="text-sm font-medium text-gray-900">
                        {domain.domain}
                      </td>
                      <td className="text-sm text-gray-500">
                        {domain.count}
                      </td>
                      <td className="text-sm text-gray-500">
                        {((domain.count / emails.general.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* En Çok Mail Gönderen Firmalar */}
      {emails?.topCompanies && emails.topCompanies.length > 0 && (
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">En Çok Mail Gönderen Firmalar</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Firma Adı</th>
                    <th>E-posta Sayısı</th>
                    <th>Yüzde</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.topCompanies.map((company, index) => (
                    <tr key={index}>
                      <td className="text-sm font-medium text-gray-900">
                        {company.companyName}
                      </td>
                      <td className="text-sm text-gray-500">
                        {company.count}
                      </td>
                      <td className="text-sm text-gray-500">
                        {((company.count / emails.general.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aylık E-posta Dağılımı */}
      {emails?.monthly && emails.monthly.length > 0 && (
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Aylık E-posta Dağılımı (Son 12 Ay)</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg p-6">
            <div className="space-y-3">
              {emails.monthly.map((month, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-500">
                    {moment(month.month).format('MMM YYYY')}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-600 h-4 rounded-full"
                        style={{
                          width: `${(month.count / Math.max(...emails.monthly.map(m => m.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {month.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;