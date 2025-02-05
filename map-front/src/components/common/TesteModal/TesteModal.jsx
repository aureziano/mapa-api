import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import './TesteModal.css';

const SlideModal = () => {
    const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal

    const handleShow = () => setShowModal(true); // Abre o modal
    const handleClose = () => setShowModal(false); // Fecha o modal

    return (
        <div>
            <Button variant="primary" onClick={handleShow}>
                Abrir Modal
            </Button>

            {/* Modal */}
            {showModal && (
                <div className="overlay">
                    <div className="slide-modal">
                        <div className="modal-header">
                            <h2>Modal com Itens em Grade</h2>
                            <button className="close-btn" onClick={handleClose}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-container">
                                <div className="grid-item">Item 1</div>
                                <div className="grid-item">Item 2</div>
                                <div className="grid-item">Item 3</div>
                                <div className="grid-item">Item 4</div>
                                <div className="grid-item">Item 5</div>
                                <div className="grid-item">Item 6</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={handleClose}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlideModal;
