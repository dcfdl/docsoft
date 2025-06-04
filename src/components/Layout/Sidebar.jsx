// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

// Adicione prop-types se estiver usando linting para isso (eslint-plugin-react)
// eslint-disable-next-line react/prop-types
const Sidebar = ({ isCollapsed, user, onNavigate, currentPath }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (e, dropdownName) => {
    e.preventDefault();
    if (isCollapsed && openDropdown === dropdownName) {
      setOpenDropdown(null);
      return;
    }
    if (isCollapsed) return; // Previne abrir novos dropdowns quando colapsado
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Função para verificar se o link deve estar ativo
  const isActive = (path) => {
    if (path === '/dashboard' && currentPath === '/') return true;
    return currentPath === path;
  };

  const handleLinkClick = (e, path, title) => {
    e.preventDefault();
    onNavigate(path, title);
    if (isCollapsed) { // Se a sidebar estiver colapsada, fechar dropdowns
        setOpenDropdown(null);
    }
  };

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-sticky-container">
        <ul className="nav flex-column nav-flex-column">
          <li className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <a className="nav-link" href="#" onClick={(e) => handleLinkClick(e, '/dashboard', 'Dashboard')}>
              <i className="bi bi-house-door-fill"></i> <span>Dashboard</span>
            </a>
          </li>
          <li className={`nav-item ${isActive('/agenda') ? 'active' : ''}`}>
            <a className="nav-link" href="#" onClick={(e) => handleLinkClick(e, '/agenda', 'Agenda')}>
              <i className="bi bi-layout-text-sidebar-reverse"></i> <span>Agenda</span>
            </a>
          </li>
          {user && user.role !== 'Aluno' && (
            <li className={`nav-item ${isActive('/pacientes') ? 'active' : ''}`}>
              {/* Atualize 'Pacientes' para a rota correta quando o componente existir */}
              <a className="nav-link" href="#" onClick={(e) => handleLinkClick(e, '/pacientes', 'Pacientes')}>
                <i className="bi bi-people"></i> <span>Pacientes</span>
              </a>
            </li>
          )}
          {user && user.role === 'Administrador' && (
            <li className={`nav-item sidebar-dropdown ${openDropdown === 'gestao' && !isCollapsed ? 'open' : ''}`}>
              <a
                className="nav-link"
                href="#"
                onClick={(e) => handleDropdownToggle(e, 'gestao')}
                aria-expanded={openDropdown === 'gestao' && !isCollapsed}
              >
                <i className="bi bi-gear-fill"></i>
                <span>Gestão</span>
                {!isCollapsed && <i className={`bi bi-chevron-right sidebar-dropdown-arrow ${openDropdown === 'gestao' ? 'open' : ''}`}></i>}
              </a>
              {!isCollapsed && openDropdown === 'gestao' && (
                <ul className="sidebar-dropdown-menu">
                  <li><a className="sidebar-dropdown-item" href="#" onClick={(e) => handleLinkClick(e, '/gestao/alunos', 'Alunos')}><i className="bi bi-person-lines-fill"></i> Alunos</a></li>
                  <li><a className="sidebar-dropdown-item" href="#" onClick={(e) => handleLinkClick(e, '/gestao/professores', 'Professores')}><i className="bi bi-person-workspace"></i> Professores</a></li>
                  <li><a className="sidebar-dropdown-item" href="#" onClick={(e) => handleLinkClick(e, '/gestao/disciplinas', 'Disciplinas')}><i className="bi bi-book"></i> Disciplinas</a></li>
                  <li><a className="sidebar-dropdown-item" href="#" onClick={(e) => handleLinkClick(e, '/gestao/secretarios', 'Secretários')}><i className="bi bi-person-gear"></i> Secretários</a></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
      {user && (
        <div className={`logged-in ${isCollapsed ? 'collapsed' : ''}`}>
          <i className="bi bi-person-circle"></i> {/* Ícone adicionado para quando estiver colapsado */}
          <span>{`Logado como: ${user.nome || 'Convidado'}`}</span>
        </div>
      )}
    </nav>
  );
};
export default Sidebar;