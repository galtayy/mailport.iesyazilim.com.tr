import React, { useState } from 'react';
import { FaReply, FaShare, FaPaperclip, FaEdit, FaEye, FaFilter, FaSearch, FaEnvelope, FaTimes } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/tr';

moment.locale('tr');

const EmailTable = ({ 
  emails, 
  loading, 
  onEmailClick, 
  onForward, 
  onReply, 
  onUpdateEmail,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange 
}) => {
  const [editingEmail, setEditingEmail] = useState(null);
  const [editForm, setEditForm] = useState({ senderName: '', companyName: '', updateAll: false });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, emailId: null, history: [] });

  const getStatusBadge = (status) => {
    const badges = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      forwarded: 'bg-green-100 text-green-800',
      replied: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      unread: 'Okunmadı',
      read: 'Okundu',
      forwarded: 'İletildi',
      replied: 'Yanıtlandı'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleEditStart = (email) => {
    setEditingEmail(email.id);
    setEditForm({
      senderName: email.senderName || '',
      companyName: email.companyName || '',
      updateAll: false
    });
  };

  const handleEditSave = async (emailId) => {
    try {
      await onUpdateEmail(emailId, editForm);
      setEditingEmail(null);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingEmail(null);
    setEditForm({ senderName: '', companyName: '', updateAll: false });
  };

  const handleHistoryClick = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5052/api/emails/${emailId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const history = await response.json();
        setHistoryModal({ isOpen: true, emailId, history });
      }
    } catch (error) {
      console.error('Geçmiş yüklenirken hata:', error);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModal({ isOpen: false, emailId: null, history: [] });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="E-posta ara..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400 h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="input w-auto"
          >
            <option value="">Tüm Durumlar</option>
            <option value="unread">Okunmadı</option>
            <option value="read">Okundu</option>
            <option value="forwarded">İletildi</option>
            <option value="replied">Yanıtlandı</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-32">Tarih</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-56">Gönderen</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-40">Firma</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Konu</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-28">Durum</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-36">Son İşlem</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-44">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emails.map((email) => (
                <tr 
                  key={email.id} 
                  className={`hover:bg-gray-50 ${email.status === 'unread' ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-4 text-gray-500">
                    <div className="text-sm font-medium">
                      {moment(email.dateReceived).format('DD.MM.YYYY')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {moment(email.dateReceived).format('HH:mm')}
                    </div>
                  </td>
                  
                  <td className="px-4 py-5 align-top">
                    {editingEmail === email.id ? (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={editForm.senderName}
                          onChange={(e) => setEditForm({...editForm, senderName: e.target.value})}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Gönderen adı"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {email.senderName || 'Bilinmiyor'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {email.senderEmail}
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-5 align-top">
                    {editingEmail === email.id ? (
                      <div className="space-y-1 pt-1">
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Firma adı"
                        />
                        <label className="flex items-start text-xs text-gray-600 leading-tight">
                          <input
                            type="checkbox"
                            checked={editForm.updateAll}
                            onChange={(e) => setEditForm({...editForm, updateAll: e.target.checked})}
                            className="mt-0.5 mr-1 h-3 w-3 text-primary-600 flex-shrink-0"
                          />
                          <span className="leading-tight">Tümünü güncelle</span>
                        </label>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-900 truncate block">
                        {email.companyName || '-'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-5">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 text-truncate">
                        {email.subject || 'Konu yok'}
                      </div>
                      {email.hasAttachments && (
                        <div className="flex items-center mt-1">
                          <FaPaperclip className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Ek dosya</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-5">
                    {getStatusBadge(email.status)}
                  </td>
                  
                  <td className="px-4 py-5 text-xs">
                    {email.status !== 'unread' && (
                      <button
                        onClick={() => handleHistoryClick(email.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer text-left w-full"
                        title="Geçmişi görüntüle"
                      >
                        {email.lastActionUser && (
                          <div className="truncate">
                            {email.lastActionUser.fullName}
                          </div>
                        )}
                        {email.readByUser && email.status === 'read' && (
                          <div className="truncate">
                            {email.readByUser.fullName}
                          </div>
                        )}
                        {email.lastActionAt && (
                          <div className="text-xs text-gray-400">
                            {moment(email.lastActionAt).format('DD.MM HH:mm')}
                          </div>
                        )}
                        {!email.lastActionAt && email.readAt && (
                          <div className="text-xs text-gray-400">
                            {moment(email.readAt).format('DD.MM HH:mm')}
                          </div>
                        )}
                      </button>
                    )}
                  </td>
                  
                  <td className="px-4 py-5">
                    <div className="flex items-center space-x-1">
                      {editingEmail === email.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(email.id)}
                            className="btn-success text-xs px-2 py-1"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="btn-outline text-xs px-2 py-1"
                          >
                            İptal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEmailClick(email)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                            title="Görüntüle"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditStart(email)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                            title="Düzenle"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onForward(email)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                            title="İlet"
                          >
                            <FaShare className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onReply(email)}
                            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md transition-colors"
                            title="Cevapla"
                          >
                            <FaReply className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="md:hidden space-y-4">
        {emails.map((email) => (
          <div 
            key={email.id} 
            className={`bg-white shadow-md rounded-lg p-5 ${email.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
          >
            {editingEmail === email.id ? (
              /* Edit Mode Card */
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">
                    {moment(email.dateReceived).format('DD.MM.YYYY HH:mm')}
                  </div>
                  {getStatusBadge(email.status)}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gönderen Adı</label>
                    <input
                      type="text"
                      value={editForm.senderName}
                      onChange={(e) => setEditForm({...editForm, senderName: e.target.value})}
                      className="input text-sm w-full"
                      placeholder="Gönderen adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Firma Adı</label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                      className="input text-sm w-full"
                      placeholder="Firma adı"
                    />
                    <label className="flex items-center mt-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={editForm.updateAll}
                        onChange={(e) => setEditForm({...editForm, updateAll: e.target.checked})}
                        className="mr-2 h-3 w-3 text-primary-600"
                      />
                      Bu domain'den gelen tüm mailleri güncelle
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={handleEditCancel}
                    className="btn-outline text-sm px-3 py-1"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleEditSave(email.id)}
                    className="btn-success text-sm px-3 py-1"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode Card */
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">
                    {moment(email.dateReceived).format('DD.MM.YYYY HH:mm')}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(email.status)}
                    {email.status !== 'unread' && (
                      <button
                        onClick={() => handleHistoryClick(email.id)}
                        className="text-xs text-gray-400 mt-1 hover:text-gray-600"
                        title="Geçmişi görüntüle"
                      >
                        {email.lastActionUser && (
                          <div>{email.lastActionUser.fullName}</div>
                        )}
                        {email.readByUser && email.status === 'read' && (
                          <div>{email.readByUser.fullName}</div>
                        )}
                        {email.lastActionAt && (
                          <div>{moment(email.lastActionAt).format('DD.MM HH:mm')}</div>
                        )}
                        {!email.lastActionAt && email.readAt && (
                          <div>{moment(email.readAt).format('DD.MM HH:mm')}</div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {email.senderName || 'Bilinmiyor'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {email.senderEmail}
                  </div>
                  {email.companyName && (
                    <div className="text-xs text-gray-600 mt-1">
                      🏢 {email.companyName}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {email.subject || 'Konu yok'}
                  </div>
                  {email.hasAttachments && (
                    <div className="flex items-center mt-1">
                      <FaPaperclip className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Ek dosya</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onEmailClick(email)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
                    >
                      <FaEye className="h-4 w-4 mr-2" />
                      Görüntüle
                    </button>
                    
                    <button
                      onClick={() => handleEditStart(email)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                    >
                      <FaEdit className="h-4 w-4 mr-2" />
                      Düzenle
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onForward(email)}
                      className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-sm font-medium transition-colors"
                    >
                      <FaShare className="h-4 w-4 mr-2" />
                      İlet
                    </button>
                    
                    <button
                      onClick={() => onReply(email)}
                      className="flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md text-sm font-medium transition-colors"
                    >
                      <FaReply className="h-4 w-4 mr-2" />
                      Cevapla
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {emails.length === 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <FaEnvelope className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">E-posta bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiç e-posta alınmamış veya filtrelere uygun e-posta yok.
            </p>
          </div>
        </div>
      )}
      
      {/* History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeHistoryModal}>
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">E-posta Geçmişi</h3>
                <button
                  onClick={closeHistoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {historyModal.history.length > 0 ? (
                  historyModal.history.map((log, index) => (
                    <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.actionType === 'mark_read' && 'Okundu işaretlendi'}
                            {log.actionType === 'forward' && 'İletildi'}
                            {log.actionType === 'reply' && 'Yanıtlandı'}
                            {log.actionType === 'edit_company' && 'Firma adı düzenlendi'}
                            {log.actionType === 'edit_sender' && 'Gönderen adı düzenlendi'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {log.user ? log.user.fullName : 'Bilinmeyen kullanıcı'}
                          </div>
                          {log.newValue && (
                            <div className="text-xs text-gray-600 mt-1">
                              {log.actionType === 'forward' && `Alıcı: ${log.newValue}`}
                              {log.actionType === 'reply' && 'Yanıt gönderildi'}
                              {log.actionType.includes('edit') && `Yeni değer: ${log.newValue}`}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Henüz herhangi bir işlem yapılmamış</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTable;