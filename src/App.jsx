import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext';
import { BookingModalProvider, useBookingModal } from './context/BookingModalContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import Modal from './components/common/Modal';
import BookingForm from './components/forms/BookingForm';
import ErrorBoundary from './components/common/ErrorBoundary';

const BookingModalWrapper = () => {
  const { isOpen, selectedTutor, closeBookingModal } = useBookingModal();
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModalTitle(selectedTutor ? 'Book' : 'Book a Session');
    }
  }, [isOpen, selectedTutor]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeBookingModal}
      title={modalTitle}
      size="md"
    >
      <BookingForm 
        tutor={selectedTutor} 
        onSuccess={closeBookingModal} 
        onSetTitle={setModalTitle} 
      />
    </Modal>
  );
};

function App() {
  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  const hasPlaceholder = rawApiUrl.includes('<') || rawApiUrl.includes('>') || rawApiUrl.includes('placeholder');
  const isApiUrlMissing = !rawApiUrl && import.meta.env.DEV;

  return (
    <HelmetProvider>
        <AuthProvider>
          <BookingModalProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-slate-50 text-slate-705 transition-colors duration-300">
                {hasPlaceholder && (
                  <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-bold z-50 sticky top-0 shadow-md">
                    ⚠️ API Configuration Warning: VITE_API_URL contains unresolved placeholders ( <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono text-white">{rawApiUrl}</code> ). Please configure your actual deployment domain. Falling back to relative route <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono text-white">/api</code>.
                  </div>
                )}
                {isApiUrlMissing && !hasPlaceholder && (
                  <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-center text-xs font-bold z-50 sticky top-0 shadow-md">
                    ⚠️ API Configuration Warning: The environment variable <code className="bg-slate-900/10 px-1.5 py-0.5 rounded font-mono">VITE_API_URL</code> is not configured. Frontend operations might fail if not proxying relative routes.
                  </div>
                )}
                <Navbar />
                <main className="flex-grow">
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                </main>
                <Footer />
                <ScrollToTop />
                <BookingModalWrapper />
              </div>
            </Router>
          </BookingModalProvider>
        </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
