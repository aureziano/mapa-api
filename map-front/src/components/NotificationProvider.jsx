import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';  // Importando o UUID
import "./Notification.css";

// Contexto para o estado de carregamento e notificações
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Provedor do Loading e Notificações
export const NotificationProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Função para adicionar uma notificação
    const addNotification = (message, type = "info", duration = 3000) => {
        const id = uuidv4();  // Usando UUID para garantir IDs únicos

        // Verifica se a notificação já existe
        const existingNotification = notifications.find(
            (n) => n.message === message && n.type === type
        );
        if (existingNotification) {
            // Se já existe uma notificação com a mesma mensagem e tipo, não adiciona
            return;
        }

        // Adiciona a notificação
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Remover a notificação após o tempo especificado
        const timeout = setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);

        // Limpar timeout caso o componente seja desmontado antes do tempo
        return () => clearTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            // Limpa todas as notificações ao desmontar o componente
            setNotifications([]);
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ loading, setLoading, addNotification }}>
            {children}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
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
