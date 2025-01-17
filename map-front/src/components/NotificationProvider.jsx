import React, { createContext, useContext, useState } from "react";
import "./Notification.css";

// Contexto para as notificações
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Componente para exibir notificações
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Função para adicionar uma notificação
    const addNotification = (message, type = "info", duration = 3000) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Remove a notificação automaticamente após o tempo especificado
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            {/* Exibição das notificações */}
            <div className="notification-container">
                {notifications.map((n) => (
                    <div key={n.id} className={`notification ${n.type}`}>
                        {n.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
