import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/bicidetalle.css';
import actualizarIcon from '../../assets/actualizar1.png';
import eliminarIcon from '../../assets/eliminar.png';

function BicicletaDetalles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bicicleta, setBicicleta] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);

  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerBicicleta();
    obtenerCategorias();
  }, [id]);

  const obtenerBicicleta = async () => {
    try {
      const response = await axios.get(`${URL}/bicicletas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBicicleta(response.data.bicicleta);
    } catch (error) {
      console.error('Error al obtener la bicicleta:', error);
      toast.error('Error al obtener la bicicleta');
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
        setBicicleta({ ...bicicleta, [name]: files[0] });
        setImagenPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setBicicleta({ ...bicicleta, [name]: value });
    }
  };

  const actualizarBicicleta = async () => {
    const formData = new FormData();
    for (const key in bicicleta) {
      if (key === 'imagen') {
        if (bicicleta[key] instanceof File) {
          formData.append(key, bicicleta[key]);
        }
      } else {
        formData.append(key, bicicleta[key]);
      }
    }

    try {
      const response = await axios.put(`${URL}/bicicletas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Bicicleta actualizada exitosamente');
      setEditando(false);
      setBicicleta(response.data.bicicleta);
      setImagenPreview(null);
    } catch (error) {
      console.error('Error al actualizar la bicicleta:', error);
      toast.error('Error al actualizar la bicicleta');
    }
  };

  const eliminarBicicleta = async () => {
    try {
      await axios.delete(`${URL}/bicicletas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Bicicleta eliminada exitosamente');
      navigate('/bicicletas');
    } catch {
      toast.error('Error al eliminar la bicicleta');
    }
  };

  const toggleEstado = async () => {
    try {
      const nuevoEstado = !bicicleta.estado;
      await axios.patch(`${URL}/bicicletas/${id}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setBicicleta({ ...bicicleta, estado: nuevoEstado });
      toast.success('Estado actualizado exitosamente');
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  if (!bicicleta) return <div>Cargando...</div>;

  return (
    <div className="bicicleta-detalles-container">
      <div className='pribici'></div>
      <button onClick={() => navigate('/bicicletas')} className="volver-btn">Volver a Bicicletas</button>
      <h1>{bicicleta.nombre}</h1>
      <div className="bicicleta-detalles-content">
        <img src={imagenPreview || `${URL}${bicicleta.imagen}`} alt={bicicleta.nombre} className="bicicleta-imagen" />
        <div className="bicicleta-info">
          {editando ? (
            <form onSubmit={(e) => { e.preventDefault(); actualizarBicicleta(); }}>
              <input type="text" name="nombre" value={bicicleta.nombre} onChange={handleInputChange} required />
              <input type="text" name="codigo" value={bicicleta.codigo} onChange={handleInputChange} required />
              <input type="text" name="marca" value={bicicleta.marca} onChange={handleInputChange} />
              <input type="text" name="modelo" value={bicicleta.modelo} onChange={handleInputChange} />
              <input type="number" name="precio_costo" value={bicicleta.precio_costo} onChange={handleInputChange} required />
              <input type="number" name="precio_venta" value={bicicleta.precio_venta} onChange={handleInputChange} required />
              <input type="number" name="stock" value={bicicleta.stock} onChange={handleInputChange} required />
              <input type="text" name="tipo_bicicleta" value={bicicleta.tipo_bicicleta} onChange={handleInputChange} />
              <input type="file" name="imagen" onChange={handleInputChange} accept="image/*" />
              <select name="id_categoria" value={bicicleta.id_categoria} onChange={handleInputChange} required>
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
            <div className="bicicleta-datos">
              <p><strong>Código:</strong> {bicicleta.codigo}</p>
              <p><strong>Marca:</strong> {bicicleta.marca}</p>
              <p><strong>Modelo:</strong> {bicicleta.modelo}</p>
              <p><strong>Precio de Costo:</strong> Q{bicicleta.precio_costo}</p>
              <p><strong>Precio de Venta:</strong> Q{bicicleta.precio_venta}</p>
              <p><strong>Stock:</strong> {bicicleta.stock}</p>
              <p><strong>Categoría:</strong> {bicicleta.nombre_categoria || 'No especificada'}</p>
              <p><strong>Estado:</strong> <span className={bicicleta.estado ? 'estado-activo' : 'estado-inactivo'}>
                {bicicleta.estado ? 'Activo' : 'Inactivo'}
              </span></p>
            </div>
          )}
        </div>
      </div>
      <div className="acciones-container">
        <img src={actualizarIcon} alt="Actualizar" onClick={() => setEditando(true)} className="accion-icon" />
        <img src={eliminarIcon} alt="Eliminar" onClick={() => setMostrarConfirmacion(true)} className="accion-icon" />
        <button onClick={toggleEstado} 
                className={`estado-toggle ${bicicleta.estado ? 'activo' : 'inactivo'}`}>
          {bicicleta.estado ? 'Desactivar' : 'Activar'}
        </button>
      </div>
      {mostrarConfirmacion && (
        <div className="modal-confirmacion">
          <div className="modal-content">
            <h2>¿Está seguro de que desea eliminar esta bicicleta?</h2>
            <div className="modal-buttons">
              <button onClick={eliminarBicicleta}>Sí, eliminar</button>
              <button onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default BicicletaDetalles;