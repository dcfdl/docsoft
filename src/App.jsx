import React, { useState, useEffect } from 'react';
import HeaderDash from './components/Layout/HeaderDash';
import Sidebar from './components/Layout/Sidebar';
import FooterContent from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

const MOCK_USER_SESSION = {
  user: { id: 1, nome: 'Dr. Davi', role: 'Administrador' }
};

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(MOCK_USER_SESSION.user);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
        />
        <main 
          className={`main-content-area ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-open'}`}
        >
          <Dashboard />
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