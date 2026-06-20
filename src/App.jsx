import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeBookingModal}
      title={selectedTutor ? 'Book Free Demo Class' : 'Request a Trial Class'}
      size="md"
    >
      <BookingForm tutor={selectedTutor} onSuccess={closeBookingModal} />
    </Modal>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookingModalProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-705 dark:text-slate-200 transition-colors duration-300">
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
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
