import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/proddetalle.css';
import actualizarIcon from '../../assets/actualizar1.png';

function ProductoDetalles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);

  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerProducto();
    obtenerCategorias();
  }, [id]);

  const obtenerProducto = async () => {
    try {
      const response = await axios.get(`${URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducto(response.data.producto);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      toast.error('Error al obtener el producto');
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get(`${URL}/categorias`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategorias(response.data.categorias);
    } catch {
      toast.error('Error al obtener las categorías');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      if (files && files[0]) {
        setProducto({ ...producto, [name]: files[0] });
        setImagenPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setProducto({ ...producto, [name]: value });
    }
  };

  const actualizarProducto = async () => {
    const formData = new FormData();
    for (const key in producto) {
      if (key === 'imagen') {
        if (producto[key] instanceof File) {
          formData.append(key, producto[key]);
        }
      } else {
        formData.append(key, producto[key]);
      }
    }

    try {
      const response = await axios.put(`${URL}/productos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Producto actualizado exitosamente');
      setEditando(false);
      setProducto(response.data.producto);
      setImagenPreview(null);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const eliminarProducto = async () => {
    try {
      await axios.delete(`${URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Producto eliminado exitosamente');
      navigate('/productos');
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  const toggleEstado = async () => {
    try {
      const nuevoEstado = !producto.estado;
      await axios.patch(`${URL}/productos/${id}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProducto({ ...producto, estado: nuevoEstado });
      toast.success('Estado actualizado exitosamente');
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  if (!producto) return <div>Cargando...</div>;

  return (
    <div className="producto-detalles-container">
      <div className="pripro"></div>
      <button onClick={() => navigate('/productos')} className="volver-btn">Volver a Productos</button>
      <h1>{producto.nombre}</h1>
      <div className="producto-detalles-content">
        <img src={imagenPreview || `${URL}${producto.imagen}`} alt={producto.nombre} className="producto-imagen" />
        <div className="producto-info">
          {editando ? (
            <form onSubmit={(e) => { e.preventDefault(); actualizarProducto(); }}>
              <input type="text" name="nombre" value={producto.nombre} onChange={handleInputChange} required />
              <input type="text" name="codigo" value={producto.codigo} onChange={handleInputChange} required />
              <input type="text" name="marca" value={producto.marca} onChange={handleInputChange} />
              <input type="number" name="precio_costo" value={producto.precio_costo} onChange={handleInputChange} required />
              <input type="number" name="precio_venta" value={producto.precio_venta} onChange={handleInputChange} required />
              <input type="number" name="stock" value={producto.stock} onChange={handleInputChange} required />
              <input type="file" name="imagen" onChange={handleInputChange} accept="image/*" />
              <select name="id_categoria" value={producto.id_categoria} onChange={handleInputChange} required>
                {categorias.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
              <button type="submit">Guardar Cambios</button>
              <button type="button" onClick={() => {
                setEditando(false);
                setImagenPreview(null);
              }}>Cancelar</button>
            </form>
          ) : (
            <div className="producto-datos">
              <p><strong>Código:</strong> {producto.codigo}</p>
              <p><strong>Marca:</strong> {producto.marca}</p>
              <p><strong>Precio de Costo:</strong> Q{producto.precio_costo}</p>
              <p><strong>Precio de Venta:</strong> Q{producto.precio_venta}</p>
              <p><strong>Stock:</strong> {producto.stock}</p>
              <p><strong>Categoría:</strong> {producto.nombre_categoria || 'No especificada'}</p>
              <p><strong>Estado:</strong> <span className={producto.estado ? 'estado-activo' : 'estado-inactivo'}>
                {producto.estado ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          )}
        </div>
      </div>
      <div className="acciones-container">
        <img src={actualizarIcon} alt="Actualizar" onClick={() => setEditando(true)} className="accion-icon" />
        <button onClick={toggleEstado} 
                className={`estado-toggle ${producto.estado ? 'activo' : 'inactivo'}`}>
          {producto.estado ? 'Desactivar' : 'Activar'}
        </button>
      </div>
      {mostrarConfirmacion && (
        <div className="modal-confirmacion">
          <div className="modal-content">
            <h2>¿Está seguro de que desea eliminar este producto?</h2>
            <div className="modal-buttons">
              <button onClick={eliminarProducto}>Sí, eliminar</button>
              <button onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ProductoDetalles;