import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ReplyModal = ({ email, isOpen, onClose, onReply }) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (email && isOpen) {
      setFormData({
        subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject || ''}`,
        content: ''
      });
    }
  }, [email, isOpen]);

  if (!isOpen || !email) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Lütfen cevap içeriği yazın.');
      return;
    }
    
    setLoading(true);
    
    try {
      await onReply(email.id, formData);
      setFormData({ subject: '', content: '' });
      onClose();
    } catch (error) {
      console.error('Cevaplama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ subject: '', content: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">E-postayı Yanıtla</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Yanıtlanacak E-posta:</strong> {email.subject}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gönderen: {email.senderName} ({email.senderEmail})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Konu
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              placeholder="E-posta konusu"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Cevap İçeriği *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="input"
              placeholder="Cevabınızı buraya yazın..."
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Orijinal Mesaj:</h4>
            <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans">
                {email.content || 'İçerik yok'}
              </pre>
            </div>
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
                  Gönderiliyor...
                </>
              ) : (
                'Cevapla'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;