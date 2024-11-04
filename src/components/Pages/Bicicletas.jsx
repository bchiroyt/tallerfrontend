import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/bicicletas.css';
import { FaSearch, FaSort } from 'react-icons/fa';

function Bicicletas() {
  const [bicicletas, setBicicletas] = useState([]);
  const [bicicletasFiltradas, setBicicletasFiltradas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaBicicleta, setNuevaBicicleta] = useState({
    id_categoria: '',
    codigo: '',
    nombre: '',
    marca: '',
    modelo: '',
    precio_costo: '',
    precio_venta: '',
    stock: '',
    descripcion: '',
    tipo_bicicleta: '',
    imagen: null
  });
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('id');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerBicicletas();
    obtenerCategorias();
  }, []);

  useEffect(() => {
    filtrarYOrdenarBicicletas();
  }, [bicicletas, busqueda, categoriaSeleccionada, ordenarPor, ordenAscendente]);

  const obtenerBicicletas = async () => {
    try {
      const response = await axios.get(`${URL}/bicicletas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBicicletas(response.data.bicicletas);
    } catch (error) {
      toast.error('Error al obtener las bicicletas');
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
      setNuevaBicicleta({ ...nuevaBicicleta, [name]: files[0] });
    } else {
      setNuevaBicicleta({ ...nuevaBicicleta, [name]: value });
    }
  };

  const crearBicicleta = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in nuevaBicicleta) {
      formData.append(key, nuevaBicicleta[key]);
    }
    try {
      await axios.post(`${URL}/bicicletas`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Bicicleta creada exitosamente');
      setMostrarModal(false);
      obtenerBicicletas();
    } catch (error) {
      toast.error('Error al crear la bicicleta');
      console.error(error);
    }
  };

  const filtrarYOrdenarBicicletas = () => {
    let bicicletasFiltradas = bicicletas.filter(bicicleta =>
      (bicicleta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      bicicleta.codigo.toLowerCase().includes(busqueda.toLowerCase())) &&
      (categoriaSeleccionada ? bicicleta.id_categoria === parseInt(categoriaSeleccionada) : true)
    );

    bicicletasFiltradas.sort((a, b) => {
      if (ordenarPor === 'id') {
        return ordenAscendente ? a.id_bicicleta - b.id_bicicleta : b.id_bicicleta - a.id_bicicleta;
      } else if (ordenarPor === 'nombre') {
        return ordenAscendente
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre);
      }
      return 0;
    });

    setBicicletasFiltradas(bicicletasFiltradas);
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
      <div className='principal'></div>
      <div className="bicicletas-header">
        <h1>Gestión de Bicicletas</h1>
        <div className="buscar-bicicleta">
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
        <button onClick={() => setMostrarModal(true)} className="nuevo-bicicleta-btn">
          + Nueva Bicicleta
        </button>
      </div>
      <div className="bicicletas-grid">
        {bicicletasFiltradas.map((bicicleta) => (
          <Link to={`/bicicletas/${bicicleta.id_bicicleta}`} key={bicicleta.id_bicicleta} className="bicicleta-card">
            <div className="bicicleta-image">
              <img src={`${URL}${bicicleta.imagen}`} alt={bicicleta.nombre} />
            </div>
            <div className="bicicleta-info">
              <h3>{bicicleta.nombre}</h3>
              <p><strong>Código:</strong> {bicicleta.codigo}</p>
              <p><strong>Precio:</strong> Q{bicicleta.precio_venta}</p>
              <p><strong>Stock:</strong> {bicicleta.stock}</p>
              <p><strong>Estado:</strong> <span className={bicicleta.estado ? 'estado-activo' : 'estado-inactivo'}>
                {bicicleta.estado ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          </Link>
        ))}
      </div>
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nueva Bicicleta</h2>
            <form onSubmit={crearBicicleta}>
              <div className="formulario-dos-columnas">
                <div className="columna">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigo">Código</label>
                    <input type="text" id="codigo" name="codigo" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="marca">Marca</label>
                    <input type="text" id="marca" name="marca" onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="modelo">Modelo</label>
                    <input type="text" id="modelo" name="modelo" onChange={handleInputChange} />
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
                    <label htmlFor="tipo_bicicleta">Tipo de Bicicleta</label>
                    <input type="text" id="tipo_bicicleta" name="tipo_bicicleta" onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="imagen">Imagen</label>
                    <input type="file" id="imagen" name="imagen" onChange={handleInputChange} accept="image/*" />
                  </div>
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit">Crear Bicicleta</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Bicicletas;