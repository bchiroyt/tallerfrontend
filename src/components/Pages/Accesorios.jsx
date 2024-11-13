import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/accesorios.css';
import { FaSearch, FaSort } from 'react-icons/fa';

function Accesorios() {
  const [accesorios, setAccesorios] = useState([]);
  const [accesoriosFiltrados, setAccesoriosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoAccesorio, setNuevoAccesorio] = useState({
    id_categoria: '',
    codigo_barra: '',
    nombre: '',
    talla: '',
    material: '',
    precio_costo: '',
    precio_venta: '',
    stock: '',
    estado_acce: true,
    imagen: null
  });
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('id');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerAccesorios();
    obtenerCategorias();
  }, []);

  useEffect(() => {
    if (accesorios && accesorios.length > 0) {
      filtrarYOrdenarAccesorios();
    } else {
      setAccesoriosFiltrados([]);
    }
  }, [accesorios, busqueda, categoriaSeleccionada, ordenarPor, ordenAscendente]);

  const obtenerAccesorios = async () => {
    try {
      const response = await axios.get(`${URL}/accesorios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccesorios(response.data.accesorios);
    } catch (error) {
      toast.error('Error al obtener los accesorios');
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
      setNuevoAccesorio({ ...nuevoAccesorio, [name]: files[0] });
    } else if (name === 'codigo_barra') {
      if (!value.startsWith('2')) {
        toast.error('El código debe comenzar con el número 2');
        return;
      }
      setNuevoAccesorio({ ...nuevoAccesorio, [name]: value });
    } else {
      setNuevoAccesorio({ ...nuevoAccesorio, [name]: value });
    }
  };

  const crearAccesorio = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Validar y agregar cada campo al FormData
    for (const key in nuevoAccesorio) {
      // No validar imagen como campo requerido
      if (nuevoAccesorio[key] === '' && 
          key !== 'talla' && 
          key !== 'material' && 
          key !== 'imagen') {
        toast.error(`El campo ${key} es requerido`);
        return;
      }
      // Solo agregar la imagen si existe
      if (key === 'imagen' && nuevoAccesorio[key]) {
        formData.append(key, nuevoAccesorio[key]);
      } else if (key !== 'imagen') {
        formData.append(key, nuevoAccesorio[key]);
      }
    }

    try {
      const response = await axios.post(`${URL}/accesorios`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.ok) {
        toast.success('Accesorio creado exitosamente');
        setMostrarModal(false);
        obtenerAccesorios();
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.msg || 'Error al crear el accesorio');
    }
  };

  const filtrarYOrdenarAccesorios = () => {
    let accesoriosFiltrados = accesorios.filter(accesorio =>
      (accesorio.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      accesorio.codigo_barra?.toLowerCase().includes(busqueda.toLowerCase())) &&
      (categoriaSeleccionada ? accesorio.id_categoria === parseInt(categoriaSeleccionada) : true)
    );

    accesoriosFiltrados.sort((a, b) => {
      if (ordenarPor === 'id') {
        return ordenAscendente ? 
          (a.id_accesorio || 0) - (b.id_accesorio || 0) : 
          (b.id_accesorio || 0) - (a.id_accesorio || 0);
      } else if (ordenarPor === 'nombre') {
        const nombreA = a.nombre || '';
        const nombreB = b.nombre || '';
        return ordenAscendente
          ? nombreA.localeCompare(nombreB)
          : nombreB.localeCompare(nombreA);
      }
      return 0;
    });

    setAccesoriosFiltrados(accesoriosFiltrados);
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
        <h1>Gestión de Accesorios</h1>
        <div className="buscar-accesorio">
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
          + Nuevo Accesorio
        </button>
      </div>
      <div className="accesorios-grid">
        {accesoriosFiltrados.map((accesorio) => (
          <Link to={`/accesorios/${accesorio.id_accesorio}`} key={accesorio.id_accesorio} className="accesorio-card">
            <div className="accesorio-image">
              <img src={`${URL}${accesorio.imagen}`} alt={accesorio.nombre} />
            </div>
            <div className="accesorio-info">
              <h3>{accesorio.nombre}</h3>
              <p><strong>Código:</strong> {accesorio.codigo_barra}</p>
              <p><strong>Precio:</strong> Q{accesorio.precio_venta}</p>
              <p><strong>Stock:</strong> {accesorio.stock}</p>
              <p><strong>Estado:</strong> <span className={accesorio.estado_acce ? 'estado-activo' : 'estado-inactivo'}>
                {accesorio.estado_acce ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          </Link>
        ))}
      </div>
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nuevo Accesorio</h2>
            <form onSubmit={crearAccesorio}>
              <div className="formulario-dos-columnas">
                <div className="columna">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigo_barra">Código de Barra</label>
                    <input 
                      type="text" 
                      id="codigo_barra" 
                      name="codigo_barra" 
                      onChange={handleInputChange} 
                      placeholder="Debe comenzar con 2"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="talla">Talla</label>
                    <input type="text" id="talla" name="talla" onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="material">Material</label>
                    <input type="text" id="material" name="material" onChange={handleInputChange} />
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
                    <label htmlFor="estado">Estado</label>
                    <select id="estado" name="estado" onChange={handleInputChange} required>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="imagen">Imagen</label>
                    <input type="file" id="imagen" name="imagen" onChange={handleInputChange} accept="image/*" />
                  </div>
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit">Crear Accesorio</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Accesorios;