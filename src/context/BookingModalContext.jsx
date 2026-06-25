import React, { createContext, useContext, useState } from 'react';

const BookingModalContext = createContext();

export const BookingModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const openBookingModal = (tutor = null) => {
    setSelectedTutor(tutor);
    setIsOpen(true);
  };

  const closeBookingModal = () => {
    setIsOpen(false);
    setSelectedTutor(null);
  };

  return (
    <BookingModalContext.Provider value={{ isOpen, selectedTutor, openBookingModal, closeBookingModal }}>
      {children}
    </BookingModalContext.Provider>
  );
};

export const useBookingModal = () => {
  const context = useContext(BookingModalContext);
  if (context === undefined) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return context;
};
