import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import './styles/global.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/task/:id" element={<TaskDetail />} />
                <Route path="/" element={<Login />} /> {/* Rota padrão */}
            </Routes>
        </Router>
    );
}

export default App;