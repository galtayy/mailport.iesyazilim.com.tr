import React, { useState, useEffect } from 'react';
import { FaSync, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import EmailTable from '../components/EmailTable';
import EmailModal from '../components/EmailModal';
import ForwardModal from '../components/ForwardModal';
import ReplyModal from '../components/ReplyModal';
import { emailAPI } from '../services/api';

const EmailsPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const fetchEmails = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
        sortBy: 'dateReceived',
        sortOrder: 'DESC'
      };

      const response = await emailAPI.getEmails(params);
      const { emails: fetchedEmails, currentPage, totalPages, totalCount } = response.data;
      
      setEmails(fetchedEmails);
      setPagination({ currentPage, totalPages, totalCount });
    } catch (error) {
      console.error('E-posta listesi hatası:', error);
      toast.error('E-postalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = async (email) => {
    try {
      const response = await emailAPI.getEmailById(email.id);
      setSelectedEmail(response.data);
      setShowEmailModal(true);
      
      if (email.status === 'unread') {
        fetchEmails(pagination.currentPage);
      }
    } catch (error) {
      console.error('E-posta detayı hatası:', error);
      toast.error('E-posta detayı yüklenirken hata oluştu');
    }
  };

  const handleUpdateEmail = async (emailId, data) => {
    try {
      await emailAPI.updateEmail(emailId, data);
      toast.success('E-posta bilgileri güncellendi');
      await fetchEmails(pagination.currentPage);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme sırasında hata oluştu');
      throw error;
    }
  };

  const handleForward = async (emailId, data) => {
    try {
      await emailAPI.forwardEmail(emailId, data);
      toast.success('E-posta başarıyla iletildi');
      await fetchEmails(pagination.currentPage);
    } catch (error) {
      console.error('İletme hatası:', error);
      toast.error('E-posta iletilirken hata oluştu');
      throw error;
    }
  };

  const handleReply = async (emailId, data) => {
    try {
      await emailAPI.replyEmail(emailId, data);
      toast.success('E-posta başarıyla yanıtlandı');
      await fetchEmails(pagination.currentPage);
    } catch (error) {
      console.error('Yanıtlama hatası:', error);
      toast.error('E-posta yanıtlanırken hata oluştu');
      throw error;
    }
  };

  const handleDownloadAttachment = async (attachmentId, filename) => {
    try {
      const response = await emailAPI.downloadAttachment(attachmentId);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Dosya indirildi');
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      toast.error('Dosya indirilirken hata oluştu');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchEmails(page);
    }
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
    const timeoutId = setTimeout(() => {
      fetchEmails(1, search, statusFilter);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchEmails(1, searchTerm, status);
  };

  const handleRefresh = () => {
    toast.promise(
      fetchEmails(pagination.currentPage),
      {
        loading: 'E-postalar yenileniyor...',
        success: 'E-postalar yenilendi',
        error: 'Yenileme sırasında hata oluştu'
      }
    );
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmails(pagination.currentPage, searchTerm, statusFilter);
    }, 60000);

    return () => clearInterval(interval);
  }, [pagination.currentPage, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaEnvelope className="mr-3 text-primary-600" />
            E-posta Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {pagination.totalCount} e-posta
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-primary flex items-center"
        >
          <FaSync className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      <EmailTable
        emails={emails}
        loading={loading}
        onEmailClick={handleEmailClick}
        onForward={(email) => {
          setSelectedEmail(email);
          setShowForwardModal(true);
        }}
        onReply={(email) => {
          setSelectedEmail(email);
          setShowReplyModal(true);
        }}
        onUpdateEmail={handleUpdateEmail}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Sayfa {pagination.currentPage} / {pagination.totalPages}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn-outline text-sm"
            >
              Önceki
            </button>
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const page = Math.max(1, pagination.currentPage - 2) + i;
              if (page > pagination.totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn text-sm ${
                    page === pagination.currentPage ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn-outline text-sm"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      <EmailModal
        email={selectedEmail}
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedEmail(null);
        }}
        onDownloadAttachment={handleDownloadAttachment}
      />

      <ForwardModal
        email={selectedEmail}
        isOpen={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setSelectedEmail(null);
        }}
        onForward={handleForward}
      />

      <ReplyModal
        email={selectedEmail}
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setSelectedEmail(null);
        }}
        onReply={handleReply}
      />
    </div>
  );
};

export default EmailsPage;