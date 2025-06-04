// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css'; // Import the updated CSS

const Sidebar = ({ isCollapsed, user }) => {
  const [openDropdown, setOpenDropdown] = useState(null); // e.g., 'gestao'

  const handleDropdownToggle = (e, dropdownName) => {
    e.preventDefault();
    if (isCollapsed && openDropdown === dropdownName) { // Allow closing even if collapsed by clicking again
        setOpenDropdown(null);
        return;
    }
    if (isCollapsed) return; // Prevent opening new dropdowns when collapsed
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };
  
  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-sticky-container"> {/* Corresponds to div.position-sticky */}
        <ul className="nav flex-column nav-flex-column"> {/* Ensure nav-flex-column is used if referenced in CSS */}
          <li className="nav-item">
            <a className="nav-link" href="#/dashboard">
              <i className="bi bi-house-door-fill"></i> <span>Dashboard</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#/agenda">
              <i className="bi bi-layout-text-sidebar-reverse"></i> <span>Agenda</span>
            </a>
          </li>
          {user && user.role !== 'Aluno' && (
            <li className="nav-item">
              <a className="nav-link" href="#/pacientes">
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
                {!isCollapsed && <i className="bi bi-chevron-right sidebar-dropdown-arrow"></i>}
              </a>
              {/* Dropdown menu should only render if not collapsed and its toggle state is open */}
              {!isCollapsed && openDropdown === 'gestao' && (
                <ul className="sidebar-dropdown-menu">
                  <li><a className="sidebar-dropdown-item" href="#/gestao/alunos"><i className="bi bi-person-lines-fill"></i> Alunos</a></li>
                  <li><a className="sidebar-dropdown-item" href="#/gestao/professores"><i className="bi bi-person-workspace"></i> Professores</a></li>
                  <li><a className="sidebar-dropdown-item" href="#/gestao/disciplinas"><i className="bi bi-book"></i> Disciplinas</a></li>
                  <li><a className="sidebar-dropdown-item" href="#/gestao/secretarios"><i className="bi bi-person-gear"></i> Secretários</a></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
      {user && (
        <div className="logged-in">
          {/* Content based on isCollapsed is handled by CSS display:none for span */}
          <span>{`Logado como: ${user.nome || 'Convidado'}`}</span>
        </div>
      )}
    </nav>
  );
};
export default Sidebar;