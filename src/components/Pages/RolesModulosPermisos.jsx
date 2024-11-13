import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/rolesmodulos.css';
import Swal from 'sweetalert2';

function RolesModulosPermisos() {
  const [roles, setRoles] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [nuevoRol, setNuevoRol] = useState({ nombre: '', descripcion: '' });
  const [nuevoModulo, setNuevoModulo] = useState({ nombre: '' });
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisosRol, setPermisosRol] = useState({});
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [mostrarModalModulo, setMostrarModalModulo] = useState(false);
  const [mostrarModalPermisos, setMostrarModalPermisos] = useState(false);
  const [permisosTemp, setPermisosTemp] = useState({});

  const token = localStorage.getItem("token");
  const URL = import.meta.env.VITE_URL

  const fetchRoles = useCallback(() => {
    axios.get(`${URL}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setRoles(response.data.roles);
      })
      .catch((error) => {
        console.error("Error al obtener roles:", error);
        toast.error("No se pudieron obtener los roles. Por favor, intenta más tarde.");
      });
  }, [token, URL]);

  const fetchModulos = useCallback(() => {
    axios.get(`${URL}/modulos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setModulos(response.data.modulos);
      })
      .catch((error) => {
        console.error("Error al obtener módulos:", error);
        toast.error("No se pudieron obtener los módulos. Por favor, intenta más tarde.");
      });
  }, [token, URL]);

  const fetchPermisos = useCallback((id_rol) => {
    axios.get(`${URL}/rolesmodulos/${id_rol}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const permisos = response.data.permisos.reduce((acc, permiso) => {
          acc[permiso.id_modulo] = true;
          return acc;
        }, {});
        setPermisosTemp(permisos);
        setPermisosRol(prevPermisos => ({
          ...prevPermisos,
          [id_rol]: permisos
        }));
      })
      .catch((error) => {
        console.error("Error al obtener permisos:", error);
        toast.error("No se pudieron obtener los permisos. Por favor, intenta más tarde.");
      });
  }, [token, URL]);

  useEffect(() => {
    fetchRoles();
    fetchModulos();
  }, [fetchRoles, fetchModulos]);

  const handleNuevoRol = (e) => {
    e.preventDefault();
    if (!nuevoRol.nombre.trim()) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }

    axios.post(`${URL}/roles`, nuevoRol, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setRoles([...roles, response.data.rol]);
        setNuevoRol({ nombre: '', descripcion: '' });
        setMostrarModalRol(false);
        toast.success("Rol creado exitosamente");
      })
      .catch((error) => {
        console.error("Error al crear rol:", error);
        toast.error(error.response?.data?.message || "Error al crear el rol");
      });
  };

  const handleNuevoModulo = (e) => {
    e.preventDefault();
    axios.post(`${URL}/modulos`, nuevoModulo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setModulos([...modulos, response.data.modulo]);
        setNuevoModulo({ nombre: '' });
        setMostrarModalModulo(false);
        toast.success("Módulo creado exitosamente");
      })
      .catch((error) => {
        console.error("Error al crear módulo:", error);
        toast.error("No se pudo crear el módulo. Por favor, intenta más tarde.");
      });
  };

  const eliminarRol = (id) => {
    if (id === 1) {
      toast.error("No se puede eliminar el rol de administrador");
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${URL}/roles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(() => {
            setRoles(roles.filter(rol => rol.id_rol !== id));
            toast.success("Rol eliminado exitosamente");
          })
          .catch((error) => {
            console.error("Error al eliminar rol:", error);
            toast.error(error.response?.data?.message || "Error al eliminar el rol");
          });
      }
    });
  };

  const eliminarModulo = (id) => {
    axios.delete(`${URL}/modulos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setModulos(modulos.filter(modulo => modulo.id_modulo !== id));
        toast.success("Módulo eliminado exitosamente");
      })
      .catch((error) => {
        console.error("Error al eliminar módulo:", error);
        toast.error("No se pudo eliminar el módulo. Por favor, intenta más tarde.");
      });
  };

  const seleccionarRol = (rol) => {
    if (rol) {
      setRolSeleccionado(rol);
      fetchPermisos(rol.id_rol);
      setMostrarModalPermisos(true);
    } else {
      toast.error("Error al seleccionar el rol");
    }
  };

  const togglePermiso = (moduloId) => {
    setPermisosTemp(prevPermisos => ({
      ...prevPermisos,
      [moduloId]: !prevPermisos[moduloId]
    }));
  };

  const guardarPermisos = () => {
    Swal.fire({
      title: '¿Guardar cambios?',
      text: "¿Deseas guardar los cambios en los permisos?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const permisosActuales = permisosRol[rolSeleccionado.id_rol] || {};
        const permisosAsignar = Object.keys(permisosTemp).filter(moduloId => 
          permisosTemp[moduloId] && !permisosActuales[moduloId]
        );
        const permisosDesasignar = Object.keys(permisosTemp).filter(moduloId => 
          !permisosTemp[moduloId] && permisosActuales[moduloId]
        );

        const asignarPromesas = permisosAsignar.map(id_modulo => 
          axios.post(`${URL}/rolesmodulos/asignar`, 
            { id_rol: rolSeleccionado.id_rol, id_modulo },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );

        const desasignarPromesas = permisosDesasignar.map(id_modulo => 
          axios.post(`${URL}/rolesmodulos/desasignar`, 
            { id_rol: rolSeleccionado.id_rol, id_modulo },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );

        Promise.all([...asignarPromesas, ...desasignarPromesas])
          .then(() => {
            setPermisosRol(prevPermisos => ({
              ...prevPermisos,
              [rolSeleccionado.id_rol]: permisosTemp
            }));
            setMostrarModalPermisos(false);
            toast.success("Permisos actualizados exitosamente");
          })
          .catch((error) => {
            console.error("Error al guardar permisos:", error);
            toast.error("Error al actualizar los permisos");
          });
      }
    });
  };

  return (
    <div className="roles-modulos-permisos-container">
      <div className="primerorol"></div>
      <h1 className="page-title">Gestión de Roles, Módulos y Permisos</h1>
      
      <div className="section roles-section">
        <h2>Roles</h2>
        <button onClick={() => setMostrarModalRol(true)} className="crear-btn">Crear Nuevo Rol</button>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(rol => (
              <tr key={rol.id_rol}>
                <td>{rol.id_rol}</td>
                <td>{rol.nombre}</td>
                <td>{rol.descripcion}</td>
                <td>
                  <button onClick={() => seleccionarRol(rol)}>Permisos</button>
                  {rol.id_rol !== 1 && (
                    <button onClick={() => eliminarRol(rol.id_rol)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section modulos-section">
        <h2>Módulos</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map(modulo => (
              <tr key={modulo.id_modulo}>
                <td>{modulo.id_modulo}</td>
                <td>{modulo.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModalRol && (
        <div className="modal">
          <div className="modal-content">
            <h2>Crear Nuevo Rol</h2>
            <form onSubmit={handleNuevoRol}>
              <input
                type="text"
                placeholder="Nombre del rol"
                value={nuevoRol.nombre}
                onChange={(e) => setNuevoRol({...nuevoRol, nombre: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Descripción"
                value={nuevoRol.descripcion}
                onChange={(e) => setNuevoRol({...nuevoRol, descripcion: e.target.value})}
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModalRol(false)}>Cancelar</button>
                <button type="submit">Aceptar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalModulo && (
        <div className="modal">
          <div className="modal-content">
            <h2>Crear Nuevo Módulo</h2>
            <form onSubmit={handleNuevoModulo}>
              <input
                type="text"
                placeholder="Nombre del módulo"
                value={nuevoModulo.nombre}
                onChange={(e) => setNuevoModulo({...nuevoModulo, nombre: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModalModulo(false)}>Cancelar</button>
                <button type="submit">Aceptar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalPermisos && rolSeleccionado && (
        <div className="modal">
          <div className="permisos-modal">
            <h2>Permisos para {rolSeleccionado.nombre}</h2>
            <form>
              <div className="permisos-grid">
                {modulos.map(modulo => (
                  <div key={modulo.id_modulo} className="permiso-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={permisosTemp[modulo.id_modulo] || false}
                        onChange={() => togglePermiso(modulo.id_modulo)}
                      />
                      {modulo.nombre}
                    </label>
                  </div>
                ))}
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModalPermisos(false)}>Cancelar</button>
                <button type="button" onClick={guardarPermisos}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default RolesModulosPermisos;