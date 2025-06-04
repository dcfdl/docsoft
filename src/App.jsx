// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'; // <<< Adicionar
import HeaderDash from './components/Layout/HeaderDash';
import Sidebar from './components/Layout/Sidebar';
import FooterContent from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import Agenda from './components/Agenda/Agenda'; // <<< Adicionar componente da Agenda
import './App.css';

const MOCK_USER_SESSION = {
  user: { id: 1, nome: 'Dr. Davi', role: 'Administrador' } // Assumimos aluno_id = 1 para o mock
};

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation(); // Hook para obter a rota atual
  const navigate = useNavigate(); // Hook para navegação programática

  useEffect(() => {
    setCurrentUser(MOCK_USER_SESSION.user);
  }, []);

  // Atualizar título da página com base na rota
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') setPageTitle("Dashboard");
    else if (path === '/agenda') setPageTitle("Agenda");
    else if (path === '/pacientes') setPageTitle("Pacientes");
    // Adicione outros títulos conforme necessário
    else setPageTitle("Clínica"); // Título padrão
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Função para ser passada para a Sidebar para lidar com a navegação
  const handleNavigation = (path, title) => {
    navigate(path);
    // O título será atualizado pelo useEffect acima que observa location.pathname
  };

  return (
    <div className="app-container">
      <HeaderDash
        pageTitle={pageTitle}
        onToggleSidebar={toggleSidebar}
        user={currentUser}
      />
      <div className="app-body">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          user={currentUser}
          onNavigate={handleNavigation} // <<< Passar handler de navegação
          currentPath={location.pathname} // <<< Passar rota atual para destacar item ativo
        />
        <main
          className={`main-content-area ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-open'}`}
        >
          <Routes> {/* <<< Definir as rotas */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda currentUser={currentUser} />} /> {/* <<< Rota da Agenda */}
            {/* Exemplo de outra rota, caso você crie o componente Pacientes:
            <Route path="/pacientes" element={<PacientesComponent />} /> */}
          </Routes>
        </main>
      </div>
      <footer
        className={`app-footer ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-open'}`}
      >
        <FooterContent />
      </footer>
    </div>
  );
}
export default App;