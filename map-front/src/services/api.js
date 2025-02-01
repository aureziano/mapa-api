import axios from 'axios';

// Cria uma instância do axios
const api = axios.create({
    baseURL: 'http://localhost:8086/',
    withCredentials: true, // Para enviar cookies
});

// Interceptor de requisição para adicionar o token a cada chamada
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Função para adicionar o token ao cabeçalho de cada requisição
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

// Função para configurar interceptadores
export const setupInterceptors = (setUser, navigate) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.warn('Token inválido ou expirado.');
                localStorage.removeItem('authToken');
                setUser({
                    isLoggedIn: false,
                    email: '',
                    role: [],
                    cpf: '',
                    firstName: '',
                });
                navigate('/'); // Redireciona para login
            }
            return Promise.reject(error);
        }
    );
};

export default api;
