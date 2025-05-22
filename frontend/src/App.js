import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster, toast } from 'react-hot-toast';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import EmailsPage from './pages/EmailsPage';
import UserManagement from './components/UserManagement';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import authService from './services/authService';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('emails');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hideLoading = () => {
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    };

    setTimeout(hideLoading, 1000);
    
    // Check if user is already authenticated
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      await authService.login(credentials);
      setIsAuthenticated(true);
      toast.success('Giriş başarılı!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.error || 'Giriş başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage('emails');
    toast.success('Çıkış yapıldı');
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <LoginForm onLogin={handleLogin} loading={loading} />
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#f56565',
                },
              },
            }}
          />
        </div>
      </QueryClientProvider>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'emails':
        return <EmailsPage />;
      case 'stats':
        return <Statistics />;
      case 'users':
        return authService.isAdmin() ? <UserManagement /> : <EmailsPage />;
      case 'settings':
        return <Settings />;
      default:
        return <EmailsPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Layout 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        >
          {renderCurrentPage()}
        </Layout>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#f56565',
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;