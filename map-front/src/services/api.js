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
        response => response,
        async error => {
            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                try {
                    // Tenta renovar o token automaticamente
                    const refreshToken = localStorage.getItem('refreshToken');
                    const response = await api.post('/api/auth/refreshtoken', { refreshToken });
                    
                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('authToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Se falhar, força o logout
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    navigate('/login');
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;
