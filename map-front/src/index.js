import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './context/UserContext'; // Importa o UserProvider
import { NotificationProvider } from './components/NotificationProvider'; // Importa o NotificationProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>

        <BrowserRouter /*{ Removido o parâmetro 'future={{ v7_startTransition: true }}' }*/ >
            <UserProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </UserProvider>
        </BrowserRouter>

    </React.StrictMode>
);
