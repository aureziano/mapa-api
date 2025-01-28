import axios from 'axios';

// Cria uma instância do axios
const api = axios.create({
    baseURL: 'http://localhost:8086/',
    withCredentials: true, // Para enviar cookies
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') == null ? '': localStorage.getItem('authToken')}`, // Adiciona o token JWT ao cabeçalho;
    },
});


// Função para adicionar o token ao cabeçalho de cada requisição
export const setAuthToken = (token) => {
    if (token) {
        // console.log("JWT Token:", token);
        // Se houver token, adiciona ao cabeçalho da requisição
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Caso contrário, remove o cabeçalho de autenticação
        delete api.defaults.headers.common['Authorization'];
    }
};

// Função para configurar interceptadores (passando as dependências diretamente nos componentes)
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

// Exporta a instância do axios
export default api;
