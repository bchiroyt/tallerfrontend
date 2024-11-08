import PropTypes from "prop-types";
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/"); 
  }; 

  return (
    <div className="app-container">
    
      <Header onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
      
      
      <Sidebar visible={sidebarVisible} />

     
      <div className={`content ${sidebarVisible ? 'shifted' : ''}`}>
        {children}
      </div>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
