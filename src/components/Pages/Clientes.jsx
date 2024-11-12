import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../styles/cliente.module.css'; // Cambia a CSS Modules

function Cliente() {
    const [clientes, setClientes] = useState([]);
    const [nuevaCliente, setNuevaCliente] = useState({
        nombre: "",
        email: "",
        nit: "",
        direccion: "",
        telefono: "",
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [buscar, setBuscar] = useState("");
    const [clientesFiltrados, setClientesFiltrados] = useState([]);

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerClientes = useCallback(() => {
        axios.get(`${URL}/clientes`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setClientes(response.data.clientes);
                setClientesFiltrados(response.data.clientes);
            })
            .catch((error) => {
                console.error("Error al obtener clientes:", error);
                toast.error("No se pudieron obtener los clientes. Por favor, intenta más tarde.");
            });
    }, [token, URL]);

    useEffect(() => {
        obtenerClientes();
    }, [obtenerClientes]);

    const handleInputChange = (e) => {
        setNuevaCliente({
            ...nuevaCliente,
            [e.target.name]: e.target.value,
        });
    };

    const crearCliente = (e) => {
        e.preventDefault();
        axios.post(`${URL}/clientes`, nuevaCliente, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerClientes();
                resetForm();
                setMostrarModal(false);
                toast.success("Cliente creado exitosamente");
            })
            .catch((error) => {
                console.error("Error al crear cliente:", error);
                toast.error("No se pudo crear el cliente. Por favor, intenta más tarde.");
            });
    };

    const eliminarCliente = (id) => {
        axios.delete(`${URL}/clientes/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerClientes();
                toast.success("Cliente eliminado exitosamente");
            })
            .catch((error) => {
                console.error("Error al eliminar cliente:", error);
                toast.error("No se pudo eliminar el cliente. Por favor, intenta más tarde.");
            });
    };

    const seleccionarCliente = (cliente) => {
        setModoEditar(true);
        setClienteSeleccionado(cliente);
        setNuevaCliente({
            nombre: cliente.nombre,
            nit: cliente.nit,
            email: cliente.email,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
        });
        setMostrarModal(true);
    };

    const actualizarCliente = (e) => {
        e.preventDefault();
        axios.put(`${URL}/clientes/${clienteSeleccionado.id_cliente}`, nuevaCliente, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerClientes();
                resetForm();
                setModoEditar(false);
                setMostrarModal(false);
                toast.success("Cliente actualizado exitosamente");
            })
            .catch((error) => {
                console.error("Error al actualizar cliente:", error);
                toast.error("No se pudo actualizar el cliente. Por favor, intenta más tarde.");
            });
    };

    const resetForm = () => {
        setNuevaCliente({
            nombre: "",
            nit: "",
            email: "",
            direccion: "",
            telefono: "",
        });
        setModoEditar(false); // Asegúrate de restablecer el modo de edición
    };
    

    const buscarClientes = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setClientesFiltrados(
            clientes.filter((cliente) =>
                cliente.nombre.toLowerCase().includes(searchTerm) ||
                (cliente.nit && cliente.nit.toString().toLowerCase().includes(searchTerm))
            )
        );
    };

    return (
        <div className={styles.clienteContainer}>
            <div className={styles.clie}></div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Gestión de Clientes</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar Cliente"
                        className={styles.searchInput}
                        value={buscar}
                        onChange={buscarClientes}
                    />
                    <button
                        onClick={() => { setMostrarModal(true); resetForm(); }}
                        className={styles.newClientButton}
                    >
                        <FaPlus /> Nuevo Cliente
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.clienteTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>NIT</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id_cliente}>
                                <td>{cliente.id_cliente}</td>
                                <td>{cliente.nombre}</td>
                                <td>{cliente.nit}</td>
                                <td>{cliente.email}</td>
                                <td>{cliente.direccion}</td>
                                <td>{cliente.telefono}</td>
                                <td>
                                    <FaEdit
                                        onClick={() => seleccionarCliente(cliente)}
                                        className={styles.actionIcon}
                                        title="Actualizar"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{modoEditar ? "Actualizar Cliente" : "Nuevo Cliente"}</h2>
                        <form onSubmit={modoEditar ? actualizarCliente : crearCliente}>
                            <input
                                type="text"
                                name="nombre"
                                value={nuevaCliente.nombre}
                                onChange={handleInputChange}
                                placeholder="Nombre"
                                required
                            />
                            <input
                                type="number"
                                name="nit"
                                value={nuevaCliente.nit}
                                onChange={handleInputChange}
                                placeholder="Nit"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={nuevaCliente.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                required
                            />
                            <input
                                type="text"
                                name="direccion"
                                value={nuevaCliente.direccion}
                                onChange={handleInputChange}
                                placeholder="Dirección"
                                required
                            />
                            <input
                                type="text"
                                name="telefono"
                                value={nuevaCliente.telefono}
                                onChange={handleInputChange}
                                placeholder="Teléfono"
                                required
                            />
                            <div className={styles.modalButtons}>
                                <button type="button" className={styles.cancelButton} onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className={styles.saveButton}>
                                    {modoEditar ? "Actualizar Cliente" : "Crear Cliente"}
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

export default Cliente;