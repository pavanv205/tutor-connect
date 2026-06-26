import React from 'react';
import styles from './ButtonRow.module.css';

/**
 * ButtonRow - a clean, modern UI row with " Details\ (outlined) and \Book\ (filled) buttons.
 *
 * Props:
 * onDetails: () => void // Callback when Details button is clicked
 * onBook: () => void // Callback when Book button is clicked
 * disabledBook?: boolean // Optional flag to disable the Book button
 */
const ButtonRow = ({ onDetails, onBook, disabledBook = false }) => {
 return (
 <div className={styles.buttonRow}>
 <button type=\button\ className={styles.detailsBtn} onClick={onDetails}>
 Details
 </button>
 <button
 type=\button\
 className={styles.bookBtn}
 onClick={onBook}
 disabled={disabledBook}
 >
 Book
 </button>
 </div>
 );
};

export default ButtonRow;
