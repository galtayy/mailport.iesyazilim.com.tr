import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ForwardModal = ({ email, isOpen, onClose, onForward }) => {
  const [formData, setFormData] = useState({
    to: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !email) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onForward(email.id, formData);
      setFormData({ to: '', message: '' });
      onClose();
    } catch (error) {
      console.error('İletme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ to: '', message: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">E-postayı İlet</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>İletilecek E-posta:</strong> {email.subject}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gönderen: {email.senderName} ({email.senderEmail})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
              Alıcı E-posta Adresi
            </label>
            <input
              type="email"
              id="to"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="input"
              placeholder="Boş bırakırsanız varsayılan adrese iletilir"
            />
            <p className="mt-1 text-xs text-gray-500">
              Boş bırakırsanız sistem ayarlarındaki varsayılan e-posta adresine iletilir.
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              İletme Mesajı (Opsiyonel)
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="input"
              placeholder="İletme ile birlikte göndermek istediğiniz mesaj..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-outline"
              disabled={loading}
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
                  İletiliyor...
                </>
              ) : (
                'İlet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForwardModal;