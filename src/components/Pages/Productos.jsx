import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/producto.css';
import { FaSearch, FaSort } from 'react-icons/fa';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    id_categoria: '',
    codigo: '',
    nombre: '',
    marca: '',
    descripcion: '',
    precio_costo: '',
    precio_venta: '',
    stock: '',
    estado: 'activo',
    imagen: null
  });
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('id');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  useEffect(() => {
    filtrarYOrdenarProductos();
  }, [productos, busqueda, categoriaSeleccionada, ordenarPor, ordenAscendente]);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get(`${URL}/productos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProductos(response.data.productos);
    } catch (error) {
      toast.error('Error al obtener los productos');
      console.error(error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get(`${URL}/categorias`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategorias(response.data.categorias);
    } catch (error) {
      toast.error('Error al obtener las categorías');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      setNuevoProducto({ ...nuevoProducto, [name]: files[0] });
    } else if (name === 'codigo') {
      if (!value.startsWith('1')) {
        toast.error('El código debe comenzar con el número 1');
        return;
      }
      setNuevoProducto({ ...nuevoProducto, [name]: value });
    } else {
      setNuevoProducto({ ...nuevoProducto, [name]: value });
    }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in nuevoProducto) {
      formData.append(key, nuevoProducto[key]);
    }
    try {
      await axios.post(`${URL}/productos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Producto creado exitosamente');
      setMostrarModal(false);
      obtenerProductos();
    } catch (error) {
      toast.error('Error al crear el producto');
      console.error(error);
    }
  };

  const filtrarYOrdenarProductos = () => {
    let productosFiltrados = productos.filter(producto =>
      (producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase())) &&
      (categoriaSeleccionada ? producto.id_categoria === parseInt(categoriaSeleccionada) : true)
    );

    productosFiltrados.sort((a, b) => {
      if (ordenarPor === 'id') {
        return ordenAscendente ? a.id_producto - b.id_producto : b.id_producto - a.id_producto;
      } else if (ordenarPor === 'nombre') {
        return ordenAscendente
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre);
      }
      return 0;
    });

    setProductosFiltrados(productosFiltrados);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleCategoriaChange = (e) => {
    setCategoriaSeleccionada(e.target.value);
  };

  const handleOrdenarChange = (e) => {
    setOrdenarPor(e.target.value);
  };

  const toggleOrden = () => {
    setOrdenAscendente(!ordenAscendente);
  };

  return (
    <div className="acc-contenido">
      <div className="principal"></div>
      <div className="accesorios-header">
        <h1>Gestión de Productos</h1>
        <div className="buscar-producto">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por código o nombre"
            value={busqueda}
            onChange={handleBusquedaChange}
          />
        </div>
        <div className="ordenar">
          <FaSort onClick={toggleOrden} style={{ cursor: 'pointer' }} />
          <select value={ordenarPor} onChange={handleOrdenarChange}>
            <option value="id">ID {ordenAscendente ? '↑' : '↓'}</option>
            <option value="nombre">Nombre {ordenAscendente ? '↑' : '↓'}</option>
          </select>
        </div>
        <div className="categoria">
          <select value={categoriaSeleccionada} onChange={handleCategoriaChange}>
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre_categoria}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setMostrarModal(true)} className="nuevo-accesorio-btn">
          + Nuevo Producto
        </button>
      </div>
      <div className="accesorios-grid">
        {productosFiltrados.map((producto) => (
          <Link to={`/productos/${producto.id_producto}`} key={producto.id_producto} className="accesorio-card">
            <div className="accesorio-image">
              <img src={`${URL}${producto.imagen}`} alt={producto.nombre} />
            </div>
            <div className="accesorio-info">
              <h3>{producto.nombre}</h3>
              <p><strong>Código:</strong> {producto.codigo}</p>
              <p><strong>Precio:</strong> Q{producto.precio_venta}</p>
              <p><strong>Stock:</strong> {producto.stock}</p>
              <p><strong>Estado:</strong> <span className={producto.estado ? 'estado-activo' : 'estado-inactivo'}>
                {producto.estado ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          </Link>
        ))}
      </div>
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nuevo Producto</h2>
            <form onSubmit={crearProducto}>
              <div className="formulario-dos-columnas">
                <div className="columna">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigo">Código</label>
                    <input 
                      type="text" 
                      id="codigo" 
                      name="codigo" 
                      onChange={handleInputChange} 
                      placeholder="Debe comenzar con 1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="marca">Marca</label>
                    <input type="text" id="marca" name="marca" onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <input type="text" id="descripcion" name="descripcion" onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="id_categoria">Categoría</label>
                    <select id="id_categoria" name="id_categoria" onChange={handleInputChange} required>
                      <option value="">Seleccione una categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                          {categoria.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="columna">
                  <div className="form-group">
                    <label htmlFor="precio_costo">Precio de Costo</label>
                    <input type="number" id="precio_costo" name="precio_costo" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="precio_venta">Precio de Venta</label>
                    <input type="number" id="precio_venta" name="precio_venta" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input type="number" id="stock" name="stock" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="imagen">Imagen</label>
                    <input type="file" id="imagen" name="imagen" onChange={handleInputChange} accept="image/*" />
                  </div>
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit">Crear Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Productos;