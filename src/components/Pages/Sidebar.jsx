import PropTypes from "prop-types";
import "../styles/sidebar.css";
import * as jwtDecode from "jwt-decode"; 

function Sidebar({ visible }) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token no encontrado en localStorage");
    return null; // O muestra un mensaje de error adecuado
  }

  let decodedToken;
  try {
    decodedToken = jwtDecode.jwtDecode(token); // Usa jwtDecode.jwtDecode en lugar de jwt_decode
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null; // O muestra un mensaje de error adecuado
  }

  const permisos = decodedToken.permisos;
  if (!Array.isArray(permisos)) {
    console.error("Permisos no es un array:", permisos);
    return null; // O muestra un mensaje de error adecuado
  }

  const tienePermiso = (id_modulo) => {
    return permisos.some(permiso => permiso.id_modulo === id_modulo);
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
        {tienePermiso(18) && <li className="mod"><a href="./Inicio">Modulos</a></li>}
        {tienePermiso(1) && (
          <li>
            <a href="#">Reportes</a>
            <ul className="submenu">
              <li><a href="#">Reporte de Venta</a></li>
              <li><a href="#">Reporte de Ingresos</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(3) && (
          <li>
            <a href="#">Compras</a>
            <ul className="submenu">
              <li><a href="./ListaCompra">Ingreso</a></li>
              <li><a href="./Proveedor">Proveedores</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(4) && (
          <li>
            <a href="#">Ventas</a>
            <ul className="submenu">
              <li><a href="./NuevaVenta">Venta</a></li>
              <li><a href="./Clientes">Cliente</a></li>
              <li><a href="#">Devoluciones</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(2) && (
          <li>
            <a href="#">Inventario</a>
            <ul className="submenu">
              <li><a href="./Productos">Producto</a></li>
              <li><a href="./Accesorios">Accesorios</a></li>
              <li><a href="./Bicicletas">Bicicletas</a></li>
              <li><a href="./Categoria">Categoría</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(5) && (
          <li>
            <a href="#">Consultas</a>
            <ul className="submenu">
              <li><a href="#">Consulta Venta</a></li>
              <li><a href="#">Consulta Ingreso</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(6) && (
          <li>
            <a href="#">Usuarios</a>
            <ul className="submenu">
              <li><a href="./RolesModulosPermisos">Roles y Modulos</a></li>
              <li><a href="./Usuario">Usuarios</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(22) && (
          <li>
            <a href="#">Servicios</a>
            <ul className="submenu">
              <li><a href="./Citas">Citas</a></li>
              <li><a href="./Historial">Historial</a></li>
            </ul>
          </li>
        )}
        {tienePermiso(7) && (
          <li>
            <a href="#">Ayuda</a>
            <ul className="submenu">
              <li><a href="#">Manual de Usuario</a></li>
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}

Sidebar.propTypes = {
  visible: PropTypes.bool.isRequired, // Define que visible es un booleano y es requerido
};

export default Sidebar;