import React from 'react';
import '../styles/LoginForm.css';

const LoginForm = ({ 
    username, 
    password, 
    isLogin, 
    role,
    setUsername, 
    setPassword, 
    setRole,
    onSubmit,
    setIsLogin,
    error
}) => {
    return (
        <div className="login-container">
            <div className="login-box">
                <h1>{isLogin ? 'Login' : 'Cadastro'}</h1>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="login-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        required
                    />
                    {!isLogin && (
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            className="login-input"
                        >
                            <option value="developer">Developer</option>
                            <option value="architect">Architect</option>
                            <option value="user">User</option>
                        </select>
                    )}
                    <button 
                        type="submit"
                        className="login-button"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>
                
                {error && <p className="error-message">{error}</p>}
                
                <p>
                    {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                    <span 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="toggle-link"
                    >
                        {isLogin ? 'Cadastre-se' : 'Entre'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginForm; 