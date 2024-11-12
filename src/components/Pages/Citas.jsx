import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/citas.css";
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

function Citas() {
    const [citas, setCitas] = useState([]);
    const [citasFiltradas, setCitasFiltradas] = useState([]);
    const [nuevaCita, setNuevaCita] = useState({
        id_cliente: "",
        nombre_bicicleta: "",
        id_tecnico: "",
        fecha_cita: "",
        hora_cita: "",
        tipo_mantenimiento: "",
        estado_cita: "Pendiente",
        observaciones: ""
    });
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [buscar, setBuscar] = useState("");

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerCitas = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/citas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCitas(response.data.citas);
            setCitasFiltradas(response.data.citas);
        } catch (error) {
            console.error("Error al obtener citas:", error);
            toast.error("No se pudieron obtener las citas. Por favor, intenta más tarde.");
        }
    }, [token, URL]);

    const obtenerClientes = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/clientes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientes(response.data.clientes);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            toast.error("No se pudieron obtener los clientes.");
        }
    }, [token, URL]);

    const obtenerTecnicos = useCallback(async () => {
        try {
            const response = await axios.get(`${URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTecnicos(response.data.usuarios); 
        } catch (error) {
            console.error("Error al obtener técnicos:", error);
            toast.error("No se pudieron obtener los técnicos.");
        }
    }, [token, URL]);

    useEffect(() => {
        obtenerCitas();
        obtenerClientes();
        obtenerTecnicos();
    }, [obtenerCitas, obtenerClientes, obtenerTecnicos]);

    const handleInputChange = (e) => {
        setNuevaCita({ ...nuevaCita, [e.target.name]: e.target.value });
    };

    const crearCita = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${URL}/citas`, nuevaCita, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerCitas();
            resetForm();
            setMostrarModal(false);
            toast.success("Cita creada exitosamente");
        } catch (error) {
            console.error("Error al crear cita:", error);
            toast.error("No se pudo crear la cita. Por favor, intenta más tarde.");
        }
    };

    const eliminarCita = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
            try {
                await axios.delete(`${URL}/citas/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                obtenerCitas();
                toast.success("Cita eliminada exitosamente");
            } catch (error) {
                console.error("Error al eliminar cita:", error);
                toast.error("No se pudo eliminar la cita. Por favor, intenta más tarde.");
            }
        }
    };

    const seleccionarCita = (cita) => {
        setModoEditar(true);
        setCitaSeleccionada(cita);
        setNuevaCita({
            id_cliente: cita.id_cliente,
            nombre_bicicleta: cita.nombre_bicicleta,
            id_tecnico: cita.id_tecnico,
            fecha_cita: cita.fecha_cita,
            hora_cita: cita.hora_cita,
            tipo_mantenimiento: cita.tipo_mantenimiento,
            estado_cita: cita.estado_cita,
            observaciones: cita.observaciones
        });
        setMostrarModal(true);
    };

    const actualizarCita = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${URL}/citas/${citaSeleccionada.id_cita}`, nuevaCita, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerCitas();
            resetForm();
            setModoEditar(false);
            setMostrarModal(false);
            toast.success("Cita actualizada exitosamente");
        } catch (error) {
            console.error("Error al actualizar cita:", error);
            toast.error("No se pudo actualizar la cita. Por favor, intenta más tarde.");
        }
    };

    const resetForm = () => {
        setNuevaCita({
            id_cliente: "",
            nombre_bicicleta: "",
            id_tecnico: "",
            fecha_cita: "",
            hora_cita: "",
            tipo_mantenimiento: "",
            estado_cita: "Pendiente",
            observaciones: ""
        });
        setModoEditar(false);
    };

    const buscarCitas = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setCitasFiltradas(
            citas.filter((cita) =>
                cita.nombre_bicicleta.toLowerCase().includes(searchTerm)
            )
        );
    };

    return (
            <div> 
                <div className='citali'></div>
                <div className="citas-header">
                    <h1 className="nombre-pagina">Gestión de Citas de Mantenimiento</h1>
                    <input
                        type="text"
                        placeholder="Buscar Cita"
                        className="buscar-cita"
                        value={buscar}
                        onChange={buscarCitas}
                    />
                    <button
                        onClick={() => { setMostrarModal(true); resetForm(); }}
                        className="nueva-cita-btn"
                    >
                        + Nueva Cita
                    </button>
                </div>
                <div className="citas-table-container">
                    <table className="tabla-citas">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Bicicleta</th>
                                <th>Técnico</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Tipo de Mantenimiento</th>
                                <th>Estado</th>
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citasFiltradas.map((cita) => (
                                <tr key={cita.id_cita}>
                                    <td>{cita.id_cita}</td>
                                    <td>{cita.nombre_cliente}</td>
                                    <td>{cita.nombre_bicicleta}</td>
                                    <td>{cita.nombre_tecnico}</td>
                                    <td>{new Date(cita.fecha_cita).toLocaleDateString()}</td>
                                    <td>{cita.hora_cita}</td>
                                    <td>{cita.tipo_mantenimiento}</td>
                                    <td>{cita.estado_cita}</td>
                                    <td>{cita.observaciones}</td>
                                    <td>
                                        <img
                                            src={actualizarIcon}
                                            alt="Actualizar"
                                            onClick={() => seleccionarCita(cita)}
                                            className="accion-icon"
                                        />
                                        <img
                                            src={eliminarIcon}
                                            alt="Eliminar"
                                            onClick={() => eliminarCita(cita.id_cita)}
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
                            <h2>{modoEditar ? "Actualizar Cita" : "Nueva Cita"}</h2>
                            <form onSubmit={modoEditar ? actualizarCita : crearCita}>
                                <select name="id_cliente" value={nuevaCita.id_cliente} onChange={handleInputChange} required>
                                    <option value="">Seleccione un cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.nombre}</option>
                                    ))}
                                </select>
                                <input type="text" name="nombre_bicicleta" value={nuevaCita.nombre_bicicleta} onChange={handleInputChange} placeholder="Bicicleta" required />
                                <select name="id_tecnico" value={nuevaCita.id_tecnico} onChange={handleInputChange} required>
                                    <option value="">Seleccione un técnico</option>
                                    {tecnicos.map(tecnico => (
                                        <option key={tecnico.id_usuario} value={tecnico.id_usuario}>{tecnico.nombre}</option>
                                    ))}
                                </select>
                                <input type="date" name="fecha_cita" value={nuevaCita.fecha_cita} onChange={handleInputChange} placeholder="Fecha" required />
                                <input type="time" name="hora_cita" value={nuevaCita.hora_cita} onChange={handleInputChange} placeholder="Hora" required />
                                <select name="tipo_mantenimiento" value={nuevaCita.tipo_mantenimiento} onChange={handleInputChange} required>
                                    <option value="">Seleccione un tipo</option>
                                    <option value="Revisión">Revisión</option>
                                    <option value="Reparación">Reparación</option>
                                </select>
                                <input type="text" name="observaciones" value={nuevaCita.observaciones} onChange={handleInputChange} placeholder="Observaciones" />
                                <div className="modal-buttons">
                                    <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="guardar-btn">{modoEditar ? "Actualizar Cita" : "Crear Cita"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
    );
}

export default Citas;