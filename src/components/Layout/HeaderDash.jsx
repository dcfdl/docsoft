import React, { useState, useEffect, useRef } from 'react';
import { getPacientes } from '../../services/apiService'; // Updated import
import './HeaderDash.css';

const mockCurrentUser = { role: 'secretario' }; // Kept for role example if user prop is not fully implemented

const HeaderDash = ({ pageTitle, onToggleSidebar, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownActive, setIsSearchDropdownActive] = useState(false);
  const [isUserDropdownActive, setIsUserDropdownActive] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Fetch all patients once for searching
  useEffect(() => {
    const fetchAllPatients = async () => {
      setLoadingSearch(true);
      try {
        const data = await getPacientes();
        setAllPatients(data);
      } catch (error) {
        console.error("Failed to fetch all patients for search:", error);
        // Handle error appropriately, maybe set an error state
      } finally {
        setLoadingSearch(false);
      }
    };
    fetchAllPatients();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchDropdownActive(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() && allPatients.length > 0) {
      const filtered = allPatients.filter(patient =>
        patient.nome.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (patient.cpf && patient.cpf.includes(searchTerm.trim()))
      );
      setSearchResults(filtered);
      // if (filtered.length > 0) setIsSearchDropdownActive(true); // Keep active while typing
    } else {
      setSearchResults([]);
      // if (isSearchDropdownActive) setIsSearchDropdownActive(false); // Close if search term is cleared
    }
  }, [searchTerm, allPatients, isSearchDropdownActive]);

  const handleSearchFocus = () => {
    setIsSearchDropdownActive(true);
    // Optionally, show recent or all if search is empty on focus
    if (!searchTerm.trim() && allPatients.length > 0) {
        setSearchResults(allPatients.slice(0, 5)); // Show some initial results
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
        setIsSearchDropdownActive(false); // Close dropdown if search input is empty
    } else {
        setIsSearchDropdownActive(true); // Keep/Open dropdown if typing
    }
  };

  const handlePatientClick = (patient) => {
    setIsSearchDropdownActive(false);
    setSearchTerm(''); // Clear search
    alert(`Navegar para paciente: ${patient.nome} (ID: ${patient.id}) - Role: ${user?.role || mockCurrentUser.role}`);
  };

  const handleLogout = () => {
    alert('Logout clicado!');
    setIsUserDropdownActive(false);
  };
  
  const displayPageTitle = pageTitle || "DocSoft";

  return (
    <header className="header">
      <button className="btn btn-dark me-3" id="toggleSidebarButton" onClick={onToggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      <h1 className="header-title fs-4 mx-auto">{displayPageTitle}</h1>
      
      <div className="search-container ms-auto" ref={searchContainerRef}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Localizar paciente..."
            id="searchInput"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            disabled={loadingSearch}
          />
        </div>
        {isSearchDropdownActive && (
          <ul className="search-dropdown active">
            {loadingSearch && <li className="search-item text-muted p-2">Carregando pacientes...</li>}
            {!loadingSearch && searchResults.length > 0 &&
              searchResults.map(patient => (
                <li key={patient.id} className="search-item" onMouseDown={() => handlePatientClick(patient)}>
                  <span className="patient-name">{patient.nome}</span>
                  <span className="patient-info">{patient.cpf} | {patient.data_nascimento} | {patient.contato}</span>
                  <span className={`patient-status ${patient.ativo ? 'text-success' : 'text-danger'}`}>
                    {patient.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </li>
              ))}
            {!loadingSearch && searchTerm.trim() && searchResults.length === 0 && (
                <li className="search-item text-muted p-2">Nenhum paciente encontrado.</li>
            )}
            {/* Show initial suggestions on focus if search is empty */}
            {!loadingSearch && !searchTerm.trim() && allPatients.length > 0 && searchResults.length > 0 &&
             searchResults.map(patient => ( // This part shows initial suggestions
                <li key={patient.id} className="search-item" onMouseDown={() => handlePatientClick(patient)}>
                  <span className="patient-name">{patient.nome}</span>
                  <span className="patient-info">{patient.cpf}</span>
                </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`user-dropdown-container ${isUserDropdownActive ? 'active' : ''}`} ref={userDropdownRef}>
        <div className="dropdown-trigger p-2" onClick={() => setIsUserDropdownActive(!isUserDropdownActive)}>
          <i className="bi bi-person-circle fs-3"></i>
          <i className="bi bi-chevron-down dropdown-arrow"></i>
        </div>
        {isUserDropdownActive && (
          <ul className="user-dropdown-menu">
            <li><a className="user-dropdown-item" href="#/perfil">Perfil</a></li>
            <li><a className="user-dropdown-item" href="#/configuracoes">Configurações</a></li>
            <li><hr className="user-dropdown-divider" /></li>
            <li><button className="user-dropdown-item" onClick={handleLogout}>Sair</button></li>
          </ul>
        )}
      </div>
    </header>
  );
};
export default HeaderDash;