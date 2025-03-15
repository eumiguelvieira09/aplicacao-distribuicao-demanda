import React from 'react';
import ReactDOM from 'react-dom/client';  // Importando o client
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Criando o root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
