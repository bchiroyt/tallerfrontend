import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/cliente.css'; 
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

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
    const [clientesFiltrados, setClientesFiltrados] = useState([]); // Lista filtrada de clientes
    

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
                setClientesFiltrados(response.data.clientes); // Inicializa la lista filtrada
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
                setMostrarModal(false)
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
    };

    const buscarClientes = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setClientesFiltrados( // Filtra sobre la lista original
            clientes.filter((cliente) =>
                cliente.nombre.toLowerCase().includes(searchTerm) || // Buscar por nombre
                (cliente.nit && cliente.nit.toString().toLowerCase().includes(searchTerm)) // Buscar por NIT
            )
        );
    };

    return (
        <div className="cat-contenido">
            <div className='primero'> </div>
            <div className="cat-header">
                <h1 className="nombre-pagina">Gestión de Clientes</h1>
                <input
                    type="text"
                    placeholder="Buscar Cliente"
                    className="buscar-categoria"
                    value={buscar}
                    onChange={buscarClientes}
                />
                <button
                    onClick={() => { setMostrarModal(true); resetForm(); }}
                    className="nueva-categoria-btn"
                >
                    + Nuevo Cliente
                </button>
            </div>

            <div className="segundo">
                <table className="tabla-categorias">
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
                                    <img
                                        src={actualizarIcon}
                                        alt="Actualizar"
                                        onClick={() => seleccionarCliente(cliente)}
                                        className="accion-icon"
                                    />
                                    <img
                                        src={eliminarIcon}
                                        alt="Eliminar"
                                        onClick={() => eliminarCliente(cliente.id_cliente)}
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
                        <div className="modal-buttons">
                            <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button type="submit" className="guardar-btn">
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