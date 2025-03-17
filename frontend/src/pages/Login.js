// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginForm from '../components/LoginForm';
import '../styles/Login.css'; // Importe o arquivo CSS para estilização

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

axios.interceptors.request.use(request => {
    console.log('Request:', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('developer');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignup();
        }
    };

    const handleLogin = async () => {
        try {
            console.log('Tentando fazer login com:', { username, password });
            
            if (!username || !password) {
                setError('Username e senha são obrigatórios');
                return;
            }

            const response = await axiosInstance.post('/api/auth/login', { 
                username: username.trim(), 
                password: password.trim() 
            });

            console.log('Resposta do login:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            } else {
                setError('Token não recebido do servidor');
            }
        } catch (error) {
            console.error('Erro detalhado do login:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 400) {
                setError('Usuário ou senha inválidos');
            } else if (error.response?.status === 404) {
                setError('Servidor não encontrado. Verifique se o backend está rodando.');
            } else {
                setError(error.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
            }
        }
    };

    const handleSignup = async () => {
        try {
            console.log('Tentando cadastrar com:', { username, password, role });
            
            if (!username || !password) {
                setError('Username e senha são obrigatórios');
                return;
            }

            const response = await axiosInstance.post('/api/users/signup', {
                username: username.trim(),
                password: password.trim(),
                role
            });

            console.log('Resposta do cadastro:', response.data);
            setError('');
            alert('Cadastro realizado com sucesso! Por favor, faça login.');
            setIsLogin(true);
        } catch (error) {
            console.error('Erro detalhado do cadastro:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 400) {
                setError('Dados inválidos ou usuário já existe');
            } else if (error.response?.status === 404) {
                setError('Servidor não encontrado. Verifique se o backend está rodando.');
            } else {
                setError(error.response?.data?.message || 'Erro no cadastro. Tente novamente.');
            }
        }
    };

    return (
        <LoginForm
            username={username}
            password={password}
            isLogin={isLogin}
            role={role}
            setUsername={setUsername}
            setPassword={setPassword}
            setRole={setRole}
            onSubmit={handleSubmit}
            setIsLogin={setIsLogin}
            error={error}
        />
    );
};

export default Login;