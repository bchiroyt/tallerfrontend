import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from "./MainLayout";
import "../styles/historial.css";
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

function Historial() {
    const [historial, setHistorial] = useState([]);
    const [historialFiltrado, setHistorialFiltrado] = useState([]);
    const [nuevoHistorial, setNuevoHistorial] = useState({
        nombre_bicicleta: "",
        id_cita: "",
        fecha_mantenimiento: "",
        tipo_mantenimiento: "",
        descripcion_trabajos: "",
        total_costo: ""
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
    const [buscar, setBuscar] = useState("");

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerHistorial = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/historial`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistorial(response.data.historial);
            setHistorialFiltrado(response.data.historial);
        } catch (error) {
            console.error("Error al obtener historial:", error);
            toast.error("No se pudieron obtener los registros de historial.");
        }
    }, [token, URL]);

    useEffect(() => {
        obtenerHistorial();
    }, [obtenerHistorial]);

    const handleInputChange = (e) => {
        setNuevoHistorial({ ...nuevoHistorial, [e.target.name]: e.target.value });
    };

    const crearHistorial = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${URL}/historial`, nuevoHistorial, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerHistorial();
            resetForm();
            setMostrarModal(false);
            toast.success("Historial creado exitosamente");
        } catch (error) {
            console.error("Error al crear historial:", error);
            toast.error("No se pudo crear el historial. Por favor, intenta más tarde.");
        }
    };

    const eliminarHistorial = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
            try {
                await axios.delete(`${URL}/historial/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                obtenerHistorial();
                toast.success("Historial eliminado exitosamente");
            } catch (error) {
                console.error("Error al eliminar historial:", error);
                toast.error("No se pudo eliminar el historial. Por favor, intenta más tarde.");
            }
        }
    };

    const seleccionarHistorial = (registro) => {
        setModoEditar(true);
        setHistorialSeleccionado(registro);
        setNuevoHistorial({
            nombre_bicicleta: registro.nombre_bicicleta,
            id_cita: registro.id_cita,
            fecha_mantenimiento: registro.fecha_mantenimiento,
            tipo_mantenimiento: registro.tipo_mantenimiento,
            descripcion_trabajos: registro.descripcion_trabajos,
            total_costo: registro.total_costo
        });
        setMostrarModal(true);
    };

    const actualizarHistorial = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${URL}/historial/${historialSeleccionado.id_historial}`, nuevoHistorial, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerHistorial();
            resetForm();
            setModoEditar(false);
            setMostrarModal(false);
            toast.success("Historial actualizado exitosamente");
        } catch (error) {
            console.error("Error al actualizar historial:", error);
            toast.error("No se pudo actualizar el historial. Por favor, intenta más tarde.");
        }
    };

    const resetForm = () => {
        setNuevoHistorial({
            nombre_bicicleta: "",
            id_cita: "",
            fecha_mantenimiento: "",
            tipo_mantenimiento: "",
            descripcion_trabajos: "",
            total_costo: ""
        });
        setModoEditar(false);
    };

    const buscarHistorial = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setHistorialFiltrado(
            historial.filter((registro) =>
                registro.nombre_bicicleta.toLowerCase().includes(searchTerm)
            )
        );
    };

    return (
        <MainLayout>
            <div>
                <div className='hist'></div>
                <div className="historial-header">
                    <h1 className="nombre-pagina">Gestión de Historial de Mantenimiento</h1>
                    <input
                        type="text"
                        placeholder="Buscar Historial"
                        className="buscar-historial"
                        value={buscar}
                        onChange={buscarHistorial}
                    />
                    <button
                        onClick={() => { setMostrarModal(true); resetForm(); }}
                        className="nuevo-historial-btn"
                    >
                        + Nuevo Historial
                    </button>
                </div>
                <div className="historial-table-container">
                    <table className="tabla-historial">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bicicleta</th>
                                <th>ID Cita</th>
                                <th>Fecha Mantenimiento</th>
                                <th>Tipo de Mantenimiento</th>
                                <th>Descripción de Trabajos</th>
                                <th>Total Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historialFiltrado.map((registro) => (
                                <tr key={registro.id_historial}>
                                    <td>{registro.id_historial}</td>
                                    <td>{registro.nombre_bicicleta}</td>
                                    <td>{registro.id_cita}</td>
                                    <td>{new Date(registro.fecha_mantenimiento).toLocaleDateString()}</td>
                                    <td>{registro.tipo_mantenimiento}</td>
                                    <td>{registro.descripcion_trabajos}</td>
                                    <td>{registro.total_costo}</td>
                                    <td>
                                        <img
                                            src={actualizarIcon}
                                            alt="Actualizar"
                                            onClick={() => seleccionarHistorial(registro)}
                                            className="accion-icon"
                                        />
                                        <img
                                            src={eliminarIcon}
                                            alt="Eliminar"
                                            onClick={() => eliminarHistorial(registro.id_historial)}
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
                            <h2>{modoEditar ? "Actualizar Historial" : "Nuevo Historial"}</h2>
                            <form onSubmit={modoEditar ? actualizarHistorial : crearHistorial}>
                                <input type="text" name="nombre_bicicleta" value={nuevoHistorial.nombre_bicicleta} onChange={handleInputChange} placeholder="Bicicleta" required />
                                <input type="text" name="id_cita" value={nuevoHistorial.id_cita} onChange={handleInputChange} placeholder="ID Cita" required />
                                <input type="date" name="fecha_mantenimiento" value={nuevoHistorial.fecha_mantenimiento} onChange={handleInputChange} required />
                                <input type="text" name="tipo_mantenimiento" value={nuevoHistorial.tipo_mantenimiento} onChange={handleInputChange} placeholder="Tipo de Mantenimiento" required />
                                <input type="text" name="descripcion_trabajos" value={nuevoHistorial.descripcion_trabajos} onChange={handleInputChange} placeholder="Descripción de Trabajos" required />
                                <input type="number" name="total_costo" value={nuevoHistorial.total_costo} onChange={handleInputChange} placeholder="Total Costo" required />
                                <div className="modal-buttons">
                                    <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="guardar-btn">{modoEditar ? "Actualizar Historial" : "Crear Historial"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </MainLayout>
    );
}

export default Historial;