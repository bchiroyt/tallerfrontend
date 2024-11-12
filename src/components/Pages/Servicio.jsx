import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/historial.css"; 
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

function Servicio() {
    const [servicios, setServicios] = useState([]);
    const [servicioFiltrado, setServicioFiltrado] = useState([]);
    const [nuevoServicio, setNuevoServicio] = useState({
        nombre_bicicleta: "",
        id_cita: "",
        fecha_mantenimiento: "",
        tipo_mantenimiento: "",
        descripcion_trabajos: "",
        precio_servicio: ""
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [buscar, setBuscar] = useState("");

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerServicios = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/servicio`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServicios(response.data.servicios);
            setServicioFiltrado(response.data.servicios);
        } catch (error) {
            console.error("Error al obtener servicios:", error);
            toast.error("No se pudieron obtener los registros de servicio.");
        }
    }, [token, URL]);

    useEffect(() => {
        obtenerServicios();
    }, [obtenerServicios]);

    const handleInputChange = (e) => {
        setNuevoServicio({ ...nuevoServicio, [e.target.name]: e.target.value });
    };

    const crearServicio = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${URL}/servicio`, nuevoServicio, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerServicios();
            resetForm();
            setMostrarModal(false);
            toast.success("Servicio creado exitosamente");
        } catch (error) {
            console.error("Error al crear servicio:", error);
            toast.error("No se pudo crear el servicio. Por favor, intenta más tarde.");
        }
    };

    const eliminarServicio = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
            try {
                await axios.delete(`${URL}/servicio/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                obtenerServicios();
                toast.success("Servicio eliminado exitosamente");
            } catch (error) {
                console.error("Error al eliminar servicio:", error);
                toast.error("No se pudo eliminar el servicio. Por favor, intenta más tarde.");
            }
        }
    };

    const seleccionarServicio = (registro) => {
        setModoEditar(true);
        setServicioSeleccionado(registro);
        setNuevoServicio({
            nombre_bicicleta: registro.nombre_bicicleta,
            id_cita: registro.id_cita,
            fecha_mantenimiento: registro.fecha_mantenimiento,
            tipo_mantenimiento: registro.tipo_mantenimiento,
            descripcion_trabajos: registro.descripcion_trabajos,
            precio_servicio: registro.precio_servicio
        });
        setMostrarModal(true);
    };

    const actualizarServicio = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${URL}/servicio/${servicioSeleccionado.id_historial}`, nuevoServicio, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerServicios();
            resetForm();
            setModoEditar(false);
            setMostrarModal(false);
            toast.success("Servicio actualizado exitosamente");
        } catch (error) {
            console.error("Error al actualizar servicio:", error);
            toast.error("No se pudo actualizar el servicio. Por favor, intenta más tarde.");
        }
    };

    const resetForm = () => {
        setNuevoServicio({
            nombre_bicicleta: "",
            id_cita: "",
            fecha_mantenimiento: "",
            tipo_mantenimiento: "",
            descripcion_trabajos: "",
            precio_servicio: ""
        });
        setModoEditar(false);
    };

    const buscarServicio = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setServicioFiltrado(
            servicios.filter((registro) =>
                registro.nombre_bicicleta.toLowerCase().includes(searchTerm)
            )
        );
    };

    return (
            <div>
                <div className='hist'></div>
                <div className="historial-header">
                    <h1 className="nombre-pagina">Gestión de Servicios de Mantenimiento</h1>
                    <input
                        type="text"
                        placeholder="Buscar Servicio"
                        className="buscar-historial"
                        value={buscar}
                        onChange={buscarServicio}
                    />
                    <button
                        onClick={() => { setMostrarModal(true); resetForm(); }}
                        className="nuevo-historial-btn"
                    >
                        + Nuevo Servicio
                    </button>
                </div>
                <div className="historial-table-container">
                    <table className="tabla-historial">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Código Servicio</th>
                                <th>Bicicleta</th>
                                <th>ID Cita</th>
                                <th>Fecha Mantenimiento</th>
                                <th>Tipo de Mantenimiento</th>
                                <th>Descripción de Trabajos</th>
                                <th>Precio Servicio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicioFiltrado.map((registro) => (
                                <tr key={registro.id_historial}>
                                    <td>{registro.id_historial}</td>
                                    <td>{registro.codigo_servicio}</td>
                                    <td>{registro.nombre_bicicleta}</td>
                                    <td>{registro.id_cita}</td>
                                    <td>{new Date(registro.fecha_mantenimiento).toLocaleDateString()}</td>
                                    <td>{registro.tipo_mantenimiento}</td>
                                    <td>{registro.descripcion_trabajos}</td>
                                    <td>{registro.precio_servicio}</td>
                                    <td>
                                        <img
                                            src={actualizarIcon}
                                            alt="Actualizar"
                                            onClick={() => seleccionarServicio(registro)}
                                            className="accion-icon"
                                        />
                                        <img
                                            src={eliminarIcon}
                                            alt="Eliminar"
                                            onClick={() => eliminarServicio(registro.id_historial)}
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
                            <h2>{modoEditar ? "Actualizar Servicio" : "Nuevo Servicio"}</h2>
                            <form onSubmit={modoEditar ? actualizarServicio : crearServicio}>
                                <input type="text" name="nombre_bicicleta" value={nuevoServicio.nombre_bicicleta} onChange={handleInputChange} placeholder="Bicicleta" required />
                                <input type="text" name="id_cita" value={nuevoServicio.id_cita} onChange={handleInputChange} placeholder="ID Cita (opcional)" />
                                <input type="date" name="fecha_mantenimiento" value={nuevoServicio.fecha_mantenimiento} onChange={handleInputChange} required />
                                <input type="text" name="tipo_mantenimiento" value={nuevoServicio.tipo_mantenimiento} onChange={handleInputChange} placeholder="Tipo de Mantenimiento" required />
                                <input type="text" name="descripcion_trabajos" value={nuevoServicio.descripcion_trabajos} onChange={handleInputChange} placeholder="Descripción de Trabajos" required />
                                <input type="number" name="precio_servicio" value={nuevoServicio.precio_servicio} onChange={handleInputChange} placeholder="Precio Servicio" required />
                                <div className="modal-buttons">
                                    <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="guardar-btn">{modoEditar ? "Actualizar Servicio" : "Crear Servicio"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
    );
}

export default Servicio;