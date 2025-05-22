import React, { useState } from 'react';
import { FaEnvelope, FaChartBar, FaCog, FaSignOutAlt, FaUser, FaUsers, FaBars, FaTimes } from 'react-icons/fa';
import authService from '../services/authService';

const Layout = ({ children, currentPage, onPageChange, onLogout }) => {
  const user = authService.getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'E-postalar', icon: FaEnvelope, key: 'emails' },
    ...(user?.role === 'admin' ? [
      { name: 'İstatistikler', icon: FaChartBar, key: 'stats' },
      { name: 'Kullanıcı Yönetimi', icon: FaUsers, key: 'users' },
      { name: 'Ayarlar', icon: FaCog, key: 'settings' }
    ] : []),
  ];

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      onLogout();
    }
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setMobileMenuOpen(false); // Mobil menüyü kapat
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FaEnvelope className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">IES MailPort</span>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handlePageChange(item.key)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        currentPage === item.key
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-3">
              {/* User Profile Dropdown */}
              <div className="relative flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role === 'admin' ? 'Admin' : 'Destek'}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  title="Çıkış Yap"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handlePageChange(item.key)}
                    className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      currentPage === item.key
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="inline mr-2 h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
              
              {/* Mobile User Info and Logout */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4 py-2">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-base">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-gray-900 truncate">
                        {user?.fullName}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {user?.role === 'admin' ? 'Admin' : 'Destek'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-400" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;