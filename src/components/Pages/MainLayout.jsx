import PropTypes from "prop-types";
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} onToggleSidebar={handleToggleSidebar} />
      <Sidebar 
        visible={sidebarVisible} 
        onToggle={handleToggleSidebar}
      />
      <main className={`content ${sidebarVisible ? 'shifted' : ''}`}>
        {children}
      </main>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
