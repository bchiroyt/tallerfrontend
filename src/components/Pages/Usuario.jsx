import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/usuario.css";
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';
import activarIcon from '../../assets/switch.png';
import Swal from 'sweetalert2';

function Usuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [roles, setRoles] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        direccion: "",
        id_rol: "",
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [buscar, setBuscar] = useState("");

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL

    const obtenerUsuarios = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data.usuarios);
            setUsuariosFiltrados(response.data.usuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            toast.error("No se pudieron obtener los usuarios. Por favor, intenta más tarde.");
        }
    }, [token, URL]);

    const obtenerRoles = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(response.data.roles);
        } catch (error) {
            console.error("Error al obtener roles:", error);
            toast.error("No se pudieron obtener los roles. Por favor, intenta más tarde.");
        }
    }, [token, URL]);

    useEffect(() => {
        obtenerUsuarios();
        obtenerRoles();
    }, [obtenerUsuarios, obtenerRoles]);

    const handleInputChange = (e) => {
        setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    };

    const crearUsuario = async (e) => {
        e.preventDefault();
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¿Deseas crear este nuevo usuario?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await axios.post(
                    `${URL}/register`, 
                    nuevoUsuario, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                Swal.fire({
                    title: 'Éxito',
                    text: 'Usuario creado exitosamente',
                    icon: 'success',
                    timer: 1500
                });
                
                obtenerUsuarios();
                resetForm();
                setMostrarModal(false);
            }
        } catch (error) {
            console.error("Error al crear usuario:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || "No se pudo crear el usuario",
                icon: 'error'
            });
        }
    };

    const eliminarUsuario = async (id) => {
        try {
            if (id === 1) {
                Swal.fire({
                    title: 'Operación no permitida',
                    text: 'No se puede eliminar el usuario administrador principal',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await axios.delete(`${URL}/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                Swal.fire(
                    'Eliminado',
                    'El usuario ha sido eliminado exitosamente',
                    'success'
                );
                obtenerUsuarios();
            }
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || "No se pudo eliminar el usuario",
                icon: 'error'
            });
        }
    };

    const seleccionarUsuario = (usuario) => {
        setModoEditar(true);
        setUsuarioSeleccionado(usuario);
        setNuevoUsuario({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            password: "",
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            id_rol: usuario.id_rol,
        });
        setMostrarModal(true);
    };

    const actualizarUsuario = async (e) => {
        e.preventDefault();
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¿Deseas actualizar este usuario?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await axios.put(
                    `${URL}/usuarios/${usuarioSeleccionado.id_usuario}`, 
                    nuevoUsuario,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                Swal.fire({
                    title: 'Éxito',
                    text: 'Usuario actualizado exitosamente',
                    icon: 'success',
                    timer: 1500
                });
                
                obtenerUsuarios();
                resetForm();
                setModoEditar(false);
                setMostrarModal(false);
            }
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || "No se pudo actualizar el usuario",
                icon: 'error'
            });
        }
    };

    const cambiarEstadoUsuario = async (id, estadoActual) => {
        try {
            if (id === 1) {
                Swal.fire({
                    title: 'Operación no permitida',
                    text: 'No se puede modificar el estado del usuario administrador principal',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Deseas ${estadoActual ? 'desactivar' : 'activar'} este usuario?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: estadoActual ? '#d33' : '#28a745',
                cancelButtonColor: '#3085d6',
                confirmButtonText: estadoActual ? 'Sí, desactivar' : 'Sí, activar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                await axios.put(`${URL}/usuarios/${id}/estado`, 
                    { estado_usu: !estadoActual },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                Swal.fire({
                    title: 'Éxito',
                    text: `Usuario ${estadoActual ? 'desactivado' : 'activado'} exitosamente`,
                    icon: 'success',
                    timer: 1500
                });
                obtenerUsuarios();
            }
        } catch (error) {
            console.error("Error al cambiar el estado del usuario:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || "No se pudo cambiar el estado del usuario",
                icon: 'error'
            });
        }
    };

    const resetForm = () => {
        setNuevoUsuario({
            nombre: "",
            apellido: "",
            email: "",
            password: "",
            telefono: "",
            direccion: "",
            id_rol: "",
        });
        setModoEditar(false); 
    };

    const buscarUsuarios = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setUsuariosFiltrados(
            usuarios.filter((usuario) =>
                `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(searchTerm)
            )
        );
    };

    return (
        <div className="s">
            <div className="primero"></div>
            <div className="usuario-header">
                <h1 className="nombre-pagina">Gestión de Usuarios</h1>
                <input
                    type="text"
                    placeholder="Buscar Usuario"
                    className="buscar-usuario"
                    value={buscar}
                    onChange={buscarUsuarios}
                />
                <button
                    onClick={() => { setMostrarModal(true); resetForm(); }}
                    className="nuevo-usuario-btn"
                >
                    + Nuevo Usuario
                </button>
            </div>
            <div className="segundo-usu">
                <table className="tabla-usuarios">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id_usuario}>
                                <td>{usuario.id_usuario}</td>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.apellido}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.telefono}</td>
                                <td>{usuario.direccion}</td>
                                <td>{usuario.nombre_rol}</td>
                                <td className={`estado ${usuario.estado_usu ? 'activo' : 'inactivo'}`}>
                                    {usuario.estado_usu ? "Activo" : "Inactivo"}
                                </td>
                                <td>
                                    <img
                                        src={actualizarIcon}
                                        alt="Actualizar"
                                        onClick={() => seleccionarUsuario(usuario)}
                                        className="accion-icon"
                                    />
                                    <img
                                        src={eliminarIcon}
                                        alt="Eliminar"
                                        onClick={() => eliminarUsuario(usuario.id_usuario)}
                                        className="accion-icon"
                                    />
                                    <img
                                        src={activarIcon}
                                        alt="Activar/Desactivar"
                                        onClick={() => cambiarEstadoUsuario(usuario.id_usuario, usuario.estado_usu)}
                                        className="accion-icon"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="modal1">
                    <div className="modal-content">
                        <h2>{modoEditar ? "Actualizar Usuario" : "Nuevo Usuario"}</h2>
                        <form onSubmit={modoEditar ? actualizarUsuario : crearUsuario}>
                            <input type="text" name="nombre" value={nuevoUsuario.nombre} onChange={handleInputChange} placeholder="Nombre" required />
                            <input type="text" name="apellido" value={nuevoUsuario.apellido} onChange={handleInputChange} placeholder="Apellido" required />
                            <input type="email" name="email" value={nuevoUsuario.email} onChange={handleInputChange} placeholder="Email" required />
                            <input type="password" name="password" value={nuevoUsuario.password} onChange={handleInputChange} placeholder="Contraseña" />
                            <input type="text" name="telefono" value={nuevoUsuario.telefono} onChange={handleInputChange} placeholder="Teléfono" />
                            <input type="text" name="direccion" value={nuevoUsuario.direccion} onChange={handleInputChange} placeholder="Dirección" />
                            <select name="id_rol" value={nuevoUsuario.id_rol} onChange={handleInputChange} required>
                                <option value="">Seleccione un rol</option>
                                {roles.map((rol) => (
                                    <option key={rol.id_rol} value={rol.id_rol}>
                                        {rol.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="modal-buttons">
                                <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="guardar-btn">{modoEditar ? "Actualizar Usuario" : "Crear Usuario"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
  );
}

export default Usuario;

