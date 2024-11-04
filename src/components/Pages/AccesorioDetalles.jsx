import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/accesoriodetalles.css';
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

function AccesorioDetalles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accesorio, setAccesorio] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);

  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerAccesorio();
    obtenerCategorias();
  }, [id]);
  
  const obtenerAccesorio = async () => {
    try {
      const response = await axios.get(`${URL}/accesorios/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccesorio(response.data.accesorio);
      console.log('Accesorio obtenido:', response.data.accesorio);
    } catch (error) {
      console.error('Error al obtener el accesorio:', error);
      toast.error('Error al obtener el accesorio');
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
        setAccesorio({ ...accesorio, [name]: files[0] });
        setImagenPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setAccesorio({ ...accesorio, [name]: value });
    }
  };

  const actualizarAccesorio = async () => {
    const formData = new FormData();
    for (const key in accesorio) {
      if (key === 'imagen') {
        if (accesorio[key] instanceof File) {
          formData.append(key, accesorio[key]);
        }
      } else {
        formData.append(key, accesorio[key]);
      }
    }

    try {
      const response = await axios.put(`${URL}/accesorios/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Accesorio actualizado exitosamente');
      setEditando(false);
      setAccesorio(response.data.accesorio);
      setImagenPreview(null);
    } catch (error) {
      console.error('Error al actualizar el accesorio:', error);
      toast.error('Error al actualizar el accesorio');
    }
  };

  const eliminarAccesorio = async () => {
    try {
      await axios.delete(`${URL}/accesorios/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Accesorio eliminado exitosamente');
      navigate('/accesorios');
    } catch {
      toast.error('Error al eliminar el accesorio');
    }
  };

  const toggleEstado = async () => {
    try {
      const nuevoEstado = !accesorio.estado_acce;
      await axios.patch(`${URL}/accesorios/${id}/estado`, 
        { estado_acce: nuevoEstado },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAccesorio({ ...accesorio, estado_acce: nuevoEstado });
      toast.success('Estado actualizado exitosamente');
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  if (!accesorio) return <div>Cargando...</div>;

  return (
    <div className="accesorio-detalles-container">
      <div className='primeroac'></div>
      <button onClick={() => navigate('/accesorios')} className="volver-btn">Volver a Accesorios</button>
      <h1>{accesorio.nombre}</h1>
      <div className="accesorio-detalles-content">
        <img src={imagenPreview || `${URL}${accesorio.imagen}`} alt={accesorio.nombre} className="accesorio-imagen" />
        <div className="accesorio-info">
          {editando ? (
            <form onSubmit={(e) => { e.preventDefault(); actualizarAccesorio(); }}>
              <input type="text" name="nombre" value={accesorio.nombre} onChange={handleInputChange} required />
              <input type="text" name="codigo_barra" value={accesorio.codigo_barra} onChange={handleInputChange} required />
              <input type="text" name="material" value={accesorio.material} onChange={handleInputChange} />
              <input type="number" name="precio_costo" value={accesorio.precio_costo} onChange={handleInputChange} required />
              <input type="number" name="precio_venta" value={accesorio.precio_venta} onChange={handleInputChange} required />
              <input type="number" name="stock" value={accesorio.stock} onChange={handleInputChange} required />
              <input type="file" name="imagen" onChange={handleInputChange} accept="image/*" />
              <select name="id_categoria" value={accesorio.id_categoria} onChange={handleInputChange} required>
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
            <div className="accesorio-datos">
              <p><strong>Código de Barra:</strong> {accesorio.codigo_barra}</p>
              <p><strong>Material:</strong> {accesorio.material}</p>
              <p><strong>Precio de Costo:</strong> Q{accesorio.precio_costo}</p>
              <p><strong>Precio de Venta:</strong> Q{accesorio.precio_venta}</p>
              <p><strong>Stock:</strong> {accesorio.stock}</p>
              <p><strong>Categoría:</strong> {accesorio.nombre_categoria || 'No especificada'}</p>
              <p><strong>Estado:</strong> <span className={accesorio.estado_acce ? 'estado-activo' : 'estado-inactivo'}>
                {accesorio.estado_acce ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          )}
        </div>
      </div>
      <div className="acciones-container">
        <img src={actualizarIcon} alt="Actualizar" onClick={() => setEditando(true)} className="accion-icon" />
        <img src={eliminarIcon} alt="Eliminar" onClick={() => setMostrarConfirmacion(true)} className="accion-icon" />
        <button onClick={toggleEstado} 
                className={`estado-toggle ${accesorio.estado_acce ? 'activo' : 'inactivo'}`}>
          {accesorio.estado_acce ? 'Desactivar' : 'Activar'}
        </button>
      </div>
      {mostrarConfirmacion && (
        <div className="modal-confirmacion">
          <div className="modal-content">
            <h2>¿Está seguro de que desea eliminar este accesorio?</h2>
            <div className="modal-buttons">
              <button onClick={eliminarAccesorio}>Sí, eliminar</button>
              <button onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AccesorioDetalles;