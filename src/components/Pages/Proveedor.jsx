import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/proveedor.css'; 
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';
import activarIcon from '../../assets/switch.png'; 

function Proveedor() {
    const [proveedores, setProveedores] = useState([]);
    const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre_compañia: "",
        persona_contacto: "",
        direccion: "",
        telefono: "",
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [buscar, setBuscar] = useState("");

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerProveedores = useCallback(() => {
        axios.get(`${URL}/proveedores`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setProveedores(response.data.proveedores);
                setProveedoresFiltrados(response.data.proveedores);
            })
            .catch((error) => {
                console.error("Error al obtener proveedores:", error);
                toast.error("No se pudieron obtener los proveedores. Por favor, intenta más tarde.");
            });
    }, [token, URL]);

    useEffect(() => {
        obtenerProveedores();
    }, [obtenerProveedores]);

    const handleInputChange = (e) => {
        setNuevoProveedor({
            ...nuevoProveedor,
            [e.target.name]: e.target.value,
        });
    };

    const crearProveedor = (e) => {
        e.preventDefault();
        axios.post(`${URL}/proveedores`, nuevoProveedor, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerProveedores();
                resetForm();
                setMostrarModal(false);
                toast.success("Proveedor creado exitosamente");
            })
            .catch((error) => {
                console.error("Error al crear proveedor:", error);
                toast.error("No se pudo crear el proveedor. Por favor, intenta más tarde.");
            });
    };

    const eliminarProveedor = (id) => {
        axios.delete(`${URL}/proveedores/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerProveedores();
                toast.success("Proveedor eliminado exitosamente");
            })
            .catch((error) => {
                console.error("Error al eliminar proveedor:", error);
                toast.error("No se pudo eliminar el proveedor. Por favor, intenta más tarde.");
            });
    };

    const seleccionarProveedor = (proveedor) => {
        setModoEditar(true);
        setProveedorSeleccionado(proveedor);
        setNuevoProveedor({
            nombre_compañia: proveedor.nombre_compañia,
            persona_contacto: proveedor.persona_contacto,
            direccion: proveedor.direccion,
            telefono: proveedor.telefono,
        });
        setMostrarModal(true);
    };

    const actualizarProveedor = (e) => {
        e.preventDefault();
        axios.put(`${URL}/proveedores/${proveedorSeleccionado.id_proveedor}`, nuevoProveedor, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerProveedores();
                resetForm();
                setModoEditar(false);
                setMostrarModal(false);
                toast.success("Proveedor actualizado exitosamente");
            })
            .catch((error) => {
                console.error("Error al actualizar proveedor:", error);
                toast.error("No se pudo actualizar el proveedor. Por favor, intenta más tarde.");
            });
    };

    const resetForm = () => {
        setNuevoProveedor({
            nombre_compañia: "",
            persona_contacto: "",
            direccion: "",
            telefono: "",
        }); 
        setModoEditar(false);
    };

    const buscarProveedores = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setProveedoresFiltrados(
            proveedores.filter((proveedor) =>
                proveedor.nombre_compañia.toLowerCase().includes(searchTerm) ||
                proveedor.persona_contacto.toLowerCase().includes(searchTerm)
            )
        );
    };

    const toggleEstadoProveedor = (proveedor) => {
        const nuevoEstado = !proveedor.estado_prov; 
        axios.patch(`${URL}/proveedores/${proveedor.id_proveedor}/estado`, { estado_prov: nuevoEstado }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerProveedores();
                toast.success(`Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
            })
            .catch((error) => {
                console.error("Error al cambiar el estado del proveedor:", error);
                toast.error("No se pudo cambiar el estado del proveedor. Por favor, intenta más tarde.");
            });
    };

    return (
        <div className="cat-contenido">
            <div className="primero"></div>
            <div className="cat-header">
                <h1 className="nombre-pagina">Gestión de Proveedores</h1>
                <input
                    type="text"
                    placeholder="Buscar Proveedor"
                    className="buscar-categoria"
                    value={buscar}
                    onChange={buscarProveedores}
                />
                <button
                    onClick={() => { setMostrarModal(true); resetForm(); }}
                    className="nueva-categoria-btn"
                >
                    + Nuevo Proveedor
                </button>
            </div>

            <div className="segundo">
                <table className="tabla-categorias">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Compañía</th>
                            <th>Persona de Contacto</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedoresFiltrados.map((proveedor) => (
                            <tr key={proveedor.id_proveedor}>
                                <td>{proveedor.id_proveedor}</td>
                                <td>{proveedor.nombre_compañia}</td>
                                <td>{proveedor.persona_contacto}</td>
                                <td>{proveedor.telefono}</td>
                                <td className={`estado ${proveedor.estado_prov ? 'activo' : 'inactivo'}`}>
                                    {proveedor.estado_prov ? "Activo" : "Inactivo"}
                                </td>
                                <td>
                                    <img
                                        src={actualizarIcon}
                                        alt="Actualizar"
                                        onClick={() => seleccionarProveedor(proveedor)}
                                        className="accion-icon"
                                    />
                                    <img
                                        src={eliminarIcon}
                                        alt="Eliminar"
                                        onClick={() => eliminarProveedor(proveedor.id_proveedor)}
                                        className="accion-icon"
                                    />
                                    <img
                                        src={activarIcon}
                                        alt="Activar/Desactivar"
                                        onClick={() => toggleEstadoProveedor(proveedor)}
                                        className="accion-icon"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{modoEditar ? "Actualizar Proveedor" : "Nuevo Proveedor"}</h2>
                        <form onSubmit={modoEditar ? actualizarProveedor : crearProveedor}>
                            <input
                                type="text"
                                name="nombre_compañia"
                                value={nuevoProveedor.nombre_compañia}
                                onChange={handleInputChange}
                                placeholder="Nombre de la compañía"
                                required
                            />
                            <input
                                type="text"
                                name="persona_contacto"
                                value={nuevoProveedor.persona_contacto}
                                onChange={handleInputChange}
                                placeholder="Persona de contacto"
                                required
                            />
                            <input
                                type="text"
                                name="direccion"
                                value={nuevoProveedor.direccion}
                                onChange={handleInputChange}
                                placeholder="Dirección"
                                required
                            />
                            <input
                                type="text"
                                name="telefono"
                                value={nuevoProveedor.telefono}
                                onChange={handleInputChange}
                                placeholder="Teléfono"
                                required
                            />
                            <div className="modal-buttons">
                                <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="guardar-btn">
                                    {modoEditar ? "Actualizar Proveedor" : "Crear Proveedor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default Proveedor;