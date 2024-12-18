import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/categoria.css';
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';
import activarIcon from '../../assets/switch.png';
import Swal from 'sweetalert2';

function Categoria() {
    const [categorias, setCategorias] = useState([]);
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion: "",
        estado_cat: true,
    });
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [buscar, setBuscar] = useState("");
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [categoriaParaActivar, setCategoriaParaActivar] = useState(null);

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL

    const obtenerCategorias = useCallback(() => {
        axios.get(`${URL}/categorias`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setCategorias(response.data.categorias);
                setCategoriasFiltradas(response.data.categorias);
            })
            .catch((error) => {
                console.error("Error al obtener categorías:", error);
                toast.error("No se pudieron obtener las categorías. Por favor, intenta más tarde.");
            });
    }, [token, URL]);

    useEffect(() => {
        obtenerCategorias();
    }, [obtenerCategorias]);

    const handleInputChange = (e) => {
        setNuevaCategoria({
            ...nuevaCategoria,
            [e.target.name]: e.target.value,
        });
    };

    const crearCategoria = (e) => {
        e.preventDefault();
        axios.post(`${URL}/categorias`, nuevaCategoria, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerCategorias();
                resetForm();
                setMostrarModal(false);
                toast.success("Categoría creada exitosamente");
            })
            .catch((error) => {
                console.error("Error al crear categoría:", error);
                toast.error("No se pudo crear la categoría. Por favor, intenta más tarde.");
            });
    };

    const eliminarCategoria = async (id) => {
        try {
            if (id === 1) {
                Swal.fire({
                    title: 'Operación no permitida',
                    text: 'No se puede eliminar la categoría por defecto',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            const confirmacion = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Los items relacionados serán movidos a la categoría por defecto. Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                const response = await axios.delete(`${URL}/categorias/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                obtenerCategorias();
                Swal.fire({
                    title: 'Éxito',
                    text: response.data.msg,
                    icon: 'success',
                    timer: 3000
                });
            }
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || "No se pudo eliminar la categoría",
                icon: 'error'
            });
        }
    };

    const seleccionarCategoria = (categoria) => {
        setModoEditar(true);
        setCategoriaSeleccionada(categoria);
        setNuevaCategoria({
            nombre_categoria: categoria.nombre_categoria,
            descripcion: categoria.descripcion,
            estado_cat: true,
        });
        setMostrarModal(true);
    };

    const actualizarCategoria = (e) => {
        e.preventDefault();
        const categoriaActualizada = {
            ...nuevaCategoria,
            estado_cat: true,
        };

        axios.put(`${URL}/categorias/${categoriaSeleccionada.id_categoria}`, categoriaActualizada, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                obtenerCategorias();
                resetForm();
                setModoEditar(false);
                setMostrarModal(false);
                toast.success("Categoría actualizada exitosamente");
            })
            .catch((error) => {
                console.error("Error al actualizar categoría:", error);
                toast.error("No se pudo actualizar la categoría. Por favor, intenta más tarde.");
            });
    };

    const resetForm = () => {
        setNuevaCategoria({
            nombre_categoria: "",
            descripcion: "",
            estado_cat: true,
        });
        setModoEditar(false);
    };

    const buscarCategorias = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setBuscar(searchTerm);
        setCategoriasFiltradas(
            categorias.filter((categoria) =>
                categoria.nombre_categoria.toLowerCase().includes(searchTerm)
            )
        );
    };

    const toggleEstadoCategoria = async (categoria) => {
        try {
            const nuevoEstado = !categoria.estado_cat;
            
            const confirmacion = await Swal.fire({
                title: 'Confirmar acción',
                text: nuevoEstado 
                    ? '¿Estás seguro de activar esta categoría? Esto también activará todos los productos, accesorios y bicicletas relacionados.' 
                    : '¿Estás seguro de desactivar esta categoría? Esto también desactivará todos los productos, accesorios y bicicletas relacionados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: nuevoEstado ? '#28a745' : '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: nuevoEstado ? 'Sí, activar todo' : 'Sí, desactivar todo',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                const response = await axios.patch(
                    `${URL}/categorias/${categoria.id_categoria}/estado`,
                    { estado_cat: nuevoEstado },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                if (response.data.ok) {
                    obtenerCategorias();
                    Swal.fire({
                        title: 'Éxito',
                        text: response.data.msg,
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });
                }
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || 'Error al cambiar el estado de la categoría',
                icon: 'error'
            });
        }
    };

    return (
        <div className="cat-contenido">
            <div className="primero"></div>
            <div className="cat-header">
                <h1 className="nombre-pagina">Gestión de Categorías</h1>
                <input
                    type="text"
                    placeholder="Buscar Categoría"
                    className="buscar-categoria"
                    value={buscar}
                    onChange={buscarCategorias}
                />
                <button
                    onClick={() => { setMostrarModal(true); resetForm(); }}
                    className="nueva-categoria-btn"
                >
                    + Nueva Categoría
                </button>
            </div>

            <div className="segundo">
            <table className="tabla-categorias">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categoriasFiltradas.map((categoria) => (
                        <tr key={categoria.id_categoria}>
                            <td>{categoria.id_categoria}</td>
                            <td>{categoria.nombre_categoria}</td>
                            <td>{categoria.descripcion}</td>
                            <td className={`estado ${categoria.estado_cat ? 'activo' : 'inactivo'}`}>
                                {categoria.estado_cat ? "Activo" : "Inactivo"}
                            </td>
                            <td>
                                <img
                                    src={actualizarIcon}
                                    alt="Actualizar"
                                    onClick={() => seleccionarCategoria(categoria)}
                                    className="accion-icon"
                                />
                                <img
                                    src={eliminarIcon}
                                    alt="Eliminar"
                                    onClick={() => eliminarCategoria(categoria.id_categoria)}
                                    className="accion-icon"
                                />
                                <img
                                    src={activarIcon}
                                    alt="Activar/Desactivar"
                                    onClick={() => toggleEstadoCategoria(categoria)}
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
                        <h2>{modoEditar ? "Actualizar Categoría" : "Nueva Categoría"}</h2>
                        <form onSubmit={modoEditar ? actualizarCategoria : crearCategoria}>
                            <input
                                type="text"
                                name="nombre_categoria"
                                value={nuevaCategoria.nombre_categoria}
                                onChange={handleInputChange}
                                placeholder="Nombre de la categoría"
                                required
                            />
                            <textarea
                                name="descripcion"
                                value={nuevaCategoria.descripcion}
                                onChange={handleInputChange}
                                placeholder="Descripción"
                                required
                            />
                            <div className="modal-buttons">
                                <button type="button" className="cancelar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="guardar-btn">
                                    {modoEditar ? "Actualizar Categoría" : "Crear Categoría"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {mostrarConfirmacion && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Acción</h2>
                        <p>¿Estás seguro de que quieres {categoriaParaActivar?.estado_cat ? 'desactivar' : 'activar'} esta categoría?</p>
                        <div className="modal-buttons">
                            <button onClick={() => setMostrarConfirmacion(false)} className="cancelar-btn">Cancelar</button>
                            <button onClick={confirmarToggleEstado} className="guardar-btn">Aceptar</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default Categoria;