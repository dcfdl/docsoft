// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { BrowserRouter } from 'react-router-dom'; // <<< Adicionar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <<< Envolver App */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);