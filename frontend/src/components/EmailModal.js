import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperclip, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import moment from 'moment';
import DOMPurify from 'dompurify';

const ImagePreview = ({ attachmentId, filename }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5052/api/emails/attachments/${attachmentId}/view`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
        setLoading(false);
      } catch (err) {
        console.error('Image loading error:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [attachmentId]);

  if (loading) {
    return (
      <div className="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt={filename}
      className="h-16 w-16 object-cover rounded border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.open(`http://localhost:5052/api/emails/attachments/${attachmentId}/view`, '_blank')}
      title="Resmi büyütmek için tıklayın"
    />
  );
};

const EmailModal = ({ email, isOpen, onClose, onDownloadAttachment }) => {
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  
  if (!isOpen || !email) return null;

  const handleDownload = async (attachment) => {
    try {
      await onDownloadAttachment(attachment.id, attachment.originalFilename);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
    }
  };

  const sanitizedHtml = email.htmlContent ? 
    DOMPurify.sanitize(email.htmlContent, { 
      ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['style', 'class']
    }) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">E-posta Detayı</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tarih - Saat</label>
              <p className="mt-1 text-sm text-gray-900">
                {moment(email.dateReceived).format('DD.MM.YYYY HH:mm')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Durum</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  email.status === 'unread' ? 'bg-blue-100 text-blue-800' :
                  email.status === 'read' ? 'bg-gray-100 text-gray-800' :
                  email.status === 'forwarded' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {email.status === 'unread' ? 'Okunmadı' :
                   email.status === 'read' ? 'Okundu' :
                   email.status === 'forwarded' ? 'İletildi' : 'Yanıtlandı'}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gönderen</label>
              <p className="mt-1 text-sm text-gray-900">
                {email.senderName || 'Bilinmiyor'}
              </p>
              <p className="text-xs text-gray-500">{email.senderEmail}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Firma</label>
              <p className="mt-1 text-sm text-gray-900">
                {email.companyName || '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Konu</label>
            <p className="mt-1 text-sm text-gray-900">
              {email.subject || 'Konu yok'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              {sanitizedHtml ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {email.content || 'İçerik yok'}
                </pre>
              )}
            </div>
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPaperclip className="inline mr-1" />
                Ek Dosyalar ({email.attachments.length})
              </label>
              <div className="space-y-3">
                {email.attachments.slice(0, showAllAttachments ? email.attachments.length : 3).map((attachment) => {
                  const isImage = attachment.mimeType && attachment.mimeType.startsWith('image/');
                  
                  return (
                    <div key={attachment.id} className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center flex-1">
                          <FaPaperclip className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.originalFilename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(attachment.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          {isImage && (
                            <div className="ml-3 flex-shrink-0">
                              <ImagePreview 
                                attachmentId={attachment.id} 
                                filename={attachment.originalFilename} 
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDownload(attachment)}
                          className="btn-outline text-xs px-3 py-1 ml-2 flex-shrink-0"
                        >
                          <FaDownload className="h-3 w-3 mr-1" />
                          İndir
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {email.attachments.length > 3 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllAttachments(!showAllAttachments)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      {showAllAttachments ? (
                        <>
                          <FaChevronUp className="h-4 w-4 mr-2" />
                          Daha az göster
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="h-4 w-4 mr-2" />
                          {email.attachments.length - 3} dosya daha göster
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;