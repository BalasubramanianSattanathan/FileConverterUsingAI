// import React from 'react';
// import Modal from 'react-modal';

// Modal.setAppElement('#root'); // Set the root element for accessibility

// const CustomModal = ({ isOpen, onRequestClose, message }) => (
//     <Modal
//         isOpen={isOpen}
//         onRequestClose={onRequestClose}
//         contentLabel="Notification"
//         className="custom-modal"
//         overlayClassName="custom-modal-overlay"
//     >
//         <div className="modal-content">
//             <h2>Notification</h2>
//             <p>{message}</p>
//             <button onClick={onRequestClose}>Close</button>
//         </div>
//     </Modal>
// );

// export default CustomModal;

// CustomModal.js
import React from 'react';
import './CustomModal.css';

const CustomModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Notification</h2>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default CustomModal;
