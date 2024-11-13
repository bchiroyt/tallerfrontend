import PropTypes from "prop-types";
import "../styles/sidebar.css";
import * as jwtDecode from "jwt-decode"; 
import { useNavigate } from "react-router-dom";

function Sidebar({ visible, onToggle }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token no encontrado en localStorage");
    return null; 
  }

  let decodedToken;
  try {
    decodedToken = jwtDecode.jwtDecode(token); 
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null; 
  }

  const permisos = decodedToken.permisos;
  if (!Array.isArray(permisos)) {
    console.error("Permisos no es un array:", permisos);
    return null; 
  }

  const tienePermiso = (id_modulo) => {
    return permisos.some(permiso => permiso.id_modulo === id_modulo);
  };

  const handleNavigation = (path) => {
    navigate(path);
    onToggle();
  };

  return (
    <div className={`sidebar ${visible ? "visible" : ""}`}>
      <ul className="menu">
        <div>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
        {tienePermiso(18) && <li className="mod" onClick={() => handleNavigation("/Inicio")}>Módulos</li>}
        {tienePermiso(1) && (
          <li>
            <a>Reportes</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/ReportesVentas")}>Reporte de Venta</li>
              <li onClick={() => handleNavigation("/ReportesIngresos")}>Reporte de Ingresos</li>
            </ul>
          </li>
        )}
        {tienePermiso(3) && (
          <li>
            <a>Compras</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/ListaCompra")}>Ingreso</li>
              <li onClick={() => handleNavigation("/Proveedor")}>Proveedores</li>
            </ul>
          </li>
        )}
        {tienePermiso(4) && (
          <li>
            <a>Ventas</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/GestionCaja")}>Caja</li>
              <li onClick={() => handleNavigation("/Ventas")}>Venta</li>
              <li onClick={() => handleNavigation("/ListaVentas")}>Lista de Ventas</li>
              <li onClick={() => handleNavigation("/Clientes")}>Cliente</li>
            </ul>
          </li>
        )}
        {tienePermiso(2) && (
          <li>
            <a>Inventario</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/Productos")}>Producto</li>
              <li onClick={() => handleNavigation("/Accesorios")}>Accesorios</li>
              <li onClick={() => handleNavigation("/Bicicletas")}>Bicicletas</li>
              <li onClick={() => handleNavigation("/Categoria")}>Categoría</li>
            </ul>
          </li>
        )}
        {tienePermiso(6) && (
          <li>
            <a>Usuarios</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/Usuario")}>Usuarios</li>
              <li onClick={() => handleNavigation("/RolesModulosPermisos")}>Roles y Permisos</li>
            </ul>
          </li>
        )}
        {tienePermiso(22) && (
          <li>
            <a>Servicios</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/Citas")}>Citas</li>
              <li onClick={() => handleNavigation("/Servicio")}>Servicio</li>
            </ul>
          </li>
        )}
        {tienePermiso(5) && (
          <li>
            <a>Cunsultas</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/ConsultasVentas")}>ConsultasVentas</li>
              <li onClick={() => handleNavigation("/ConsultasCompras")}>ConsultasCompras</li>
            </ul>
          </li>
        )}
        {tienePermiso(7) && (
          <li>
            <a>Ayuda</a>
            <ul className="submenu">
              <li onClick={() => handleNavigation("/Manual")}>Manual de Usuario</li>
            </ul>
          </li>
        )}
         
      </ul>
    </div>
  );
}

Sidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default Sidebar;