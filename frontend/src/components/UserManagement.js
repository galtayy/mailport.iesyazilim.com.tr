import React, { useState, useEffect } from 'react';
import { FaUser, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import moment from 'moment';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'destek'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      toast.error('Kullanıcı listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.fullName) {
      toast.error('Kullanıcı adı, e-posta ve ad soyad gerekli');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Yeni kullanıcı için şifre gerekli');
      return;
    }

    try {
      setLoading(true);
      
      if (editingUser) {
        // Kullanıcı güncelleme
        await authService.updateUser(editingUser.id, formData);
        toast.success('Kullanıcı güncellendi');
      } else {
        // Yeni kullanıcı oluşturma
        await authService.createUser(formData);
        toast.success('Yeni kullanıcı oluşturuldu');
      }
      
      await fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Kullanıcı işlem hatası:', error);
      toast.error(error.response?.data?.error || 'İşlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'destek'
    });
    setEditingUser(null);
    setShowAddModal(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role
    });
    setShowAddModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await authService.deleteUser(userId);
      toast.success('Kullanıcı silindi');
      await fetchUsers();
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast.error(error.response?.data?.error || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Destek
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Aktif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Pasif
      </span>
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaUser className="mr-3 text-primary-600" />
            Kullanıcı Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {users.length} kullanıcı
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Son Giriş</th>
                <th>Kayıt Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </td>
                  
                  <td className="text-sm text-gray-900">
                    {user.email}
                  </td>
                  
                  <td>
                    {getRoleBadge(user.role)}
                  </td>
                  
                  <td>
                    {getStatusBadge(user.isActive)}
                  </td>
                  
                  <td className="text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div>
                        <div>{moment(user.lastLogin).format('DD.MM.YYYY')}</div>
                        <div className="text-xs">{moment(user.lastLogin).format('HH:mm')}</div>
                      </div>
                    ) : (
                      'Hiç giriş yapmadı'
                    )}
                  </td>
                  
                  <td className="text-sm text-gray-500">
                    {moment(user.createdAt).format('DD.MM.YYYY HH:mm')}
                  </td>
                  
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      
                      {user.id !== authService.getUser()?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <FaUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiç kullanıcı eklenmemiş.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    placeholder="Kullanıcı adı"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="E-posta adresi"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input"
                  placeholder="Ad ve soyad"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder={editingUser ? "Boş bırakırsanız değişmez" : "Şifre"}
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500">
                    Şifreyi değiştirmek istemiyorsanız boş bırakın
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  <option value="destek">Destek</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      {editingUser ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                    </>
                  ) : (
                    editingUser ? 'Güncelle' : 'Oluştur'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;