import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/detalleventa.css';

const DetalleVenta = () => {
  const [venta, setVenta] = useState(null);
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerDetalleVenta();
  }, [id]);

  const  obtenerDetalleVenta = async () => {
    try {
      const response = await axios.get(`${URL}/ventas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.ok) {
        setVenta(response.data.venta);
      }
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      toast.error('Error al obtener el detalle de la venta');
    }
  };

  const descargarPDF = () => {
    if (venta && venta.pdf_url) {
      window.open(venta.pdf_url, '_blank');
    } else {
      toast.error('No se encontró el PDF de la venta');
    }
  };

  if (!venta) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalle-venta-container">
      <h1>Detalle de Venta #{venta.id_venta}</h1>
      <div className="venta-info">
        <p><strong>Fecha:</strong> {new Date(venta.fecha_venta).toLocaleString()}</p>
        <p><strong>Cliente:</strong> {venta.cliente_nombre || 'Cliente General'}</p>
        <p><strong>Total:</strong> ${venta.total_venta}</p>
      </div>
      <h2>Productos</h2>
      <table className="productos-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {venta.detalles.map((detalle, index) => (
            <tr key={index}>
              <td>{detalle.tipo_item}</td>
              <td>{detalle.nombre || 'N/A'}</td>
              <td>{detalle.cantidad}</td>
              <td>${detalle.precio_unitario}</td>
              <td>${detalle.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="acciones">
        <button onClick={descargarPDF}>Descargar PDF</button>
        <Link to="/ventas">Volver a la lista</Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DetalleVenta;