import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import "./Notification.css";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tokenExpirationModal, setTokenExpirationModal] = useState(null);

  const addNotification = useCallback((message, type = "info", duration = 3000, persist = false) => {
    const id = uuidv4();

    setNotifications(prev => {
      const exists = prev.some(n => n.message === message && n.type === type);
      return exists ? prev : [...prev, { id, message, type, persist }];
    });

    if (!persist) {
      const timeout = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setTokenExpirationModal(null);
  }, []);

  const showExpirationModal = useCallback((onConfirm, onClose, remainingTime) => {
    setTokenExpirationModal({
      remainingTime,
      onConfirm: () => {
        onConfirm();
        setTokenExpirationModal(null);
      },
      onClose: () => {
        onClose();
        setTokenExpirationModal(null);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{
      loading,
      setLoading,
      addNotification,
      removeNotification,
      showExpirationModal
    }}>
      {children}
      
      {/* Notificações */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type} ${n.persist ? 'persistent' : ''}`}>
            {n.message}
            {n.persist && (
              <button 
                className="notification-close"
                onClick={() => removeNotification(n.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal de expiração */}
      {tokenExpirationModal && (
        <div className="token-expiration-modal">
          <div className="modal-content">
            <h3>Sua sessão expirará em {Math.floor(tokenExpirationModal.remainingTime / 60000)} minutos</h3>
            <div className="modal-actions">
              <button 
                className="confirm-button"
                onClick={tokenExpirationModal.onConfirm}
              >
                Renovar Sessão
              </button>
              <button 
                className="logout-button"
                onClick={tokenExpirationModal.onClose}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
