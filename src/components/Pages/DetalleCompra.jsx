import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/detallecompra.css';

const URL = import.meta.env.VITE_URL;

const DetalleCompra = () => {
  const [compra, setCompra] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${URL}/compras/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompra(response.data.compra);
        setDetalles(response.data.detalles);
      } catch (error) {
        console.error('Error al obtener los detalles de la compra:', error);
        alert('Error al cargar los detalles de la compra');
      }
    };

    fetchCompra();
  }, [id]);

  if (!compra) {
    return <div className="compras-container">Cargando...</div>;
  }

  return (
    <div className="compras-container">
      <div className='decom'></div> 
      <h1 className="compras-title">Detalle de Compra</h1>
      <div className="compras-details">
        <div className="compras-details-item">
          <span className="compras-details-label">Nº Comprobante:</span> {compra.numero_comprobante}
        </div>
        <div className="compras-details-item">
          <span className="compras-details-label">Tipo de Comprobante:</span> {compra.tipo_comprobante}
        </div>
        <div className="compras-details-item">
          <span className="compras-details-label">Serie:</span> {compra.serie}
        </div>
        <div className="compras-details-item">
          <span className="compras-details-label">Proveedor:</span> {compra.proveedor_nombre}
        </div>
        <div className="compras-details-item">
          <span className="compras-details-label">Fecha de Facturación:</span> {new Date(compra.fecha_facturacion).toLocaleDateString()}
        </div>
        <div className="compras-details-item">
          <span className="compras-details-label">Total:</span> Q{Number(compra.total_compra).toFixed(2)}
        </div>
      </div>

      <h2 className="compras-subtitle">Detalles de la compra</h2>
      <table className="compras-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Precio Venta</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle) => (
            <tr key={detalle.id_detalle}>
              <td>{detalle.nombre_producto}</td>
              <td>{detalle.tipo_producto}</td>
              <td>{detalle.cantidad}</td>
              <td>Q{Number(detalle.precio_unitario).toFixed(2)}</td>
              <td>Q{Number(detalle.precio_venta).toFixed(2)}</td>
              <td>Q{Number(detalle.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="compras-actions">
        <button
          className="compras-button"
          onClick={() => navigate('/ListaCompra')}
        >
          Regresar a Lista de Compras
        </button>
      </div>
    </div>
  );
};

export default DetalleCompra;