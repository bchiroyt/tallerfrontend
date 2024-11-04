import PropTypes from 'prop-types';
import '../styles/header.css';

function Header({ onLogout, onToggleSidebar }) {
  return (
    <header className="header">
      <button className="menu-btn" onClick={onToggleSidebar}>
        &#9776; {/* Icono del menú */}
      </button>
      <h1 className="header-title">Descuentazo-Bike</h1>
      <button className="logout-btn" onClick={onLogout}>
        Cerrar sesión
      </button>
    </header>
  );
}

Header.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Header;
