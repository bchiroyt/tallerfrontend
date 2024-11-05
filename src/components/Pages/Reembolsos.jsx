import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import '../styles/reembolsos.css';

export default function Reembolsos() {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [itemsReembolso, setItemsReembolso] = useState([]);
  const [motivo, setMotivo] = useState('');
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerVentas();
  }, []);

  const obtenerVentas = async () => {
    try {
      const response = await axios.get(`${URL}/ventas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVentas(response.data.ventas);
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
      toast.error('Error al obtener las ventas');
    }
  };

  const seleccionarVenta = async (id_venta) => {
    try {
      const response = await axios.get(`${URL}/ventas/${id_venta}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVentaSeleccionada(response.data.venta);
      setItemsReembolso(response.data.venta.detalles.map(item => ({
        ...item,
        cantidad_reembolso: 0
      })));
    } catch (error) {
      console.error('Error al obtener los detalles de la venta:', error);
      toast.error('Error al obtener los detalles de la venta');
    }
  };

  const actualizarCantidadReembolso = (id_detalle, cantidad) => {
    setItemsReembolso(prevItems =>
      prevItems.map(item =>
        item.id_detalle === id_detalle
          ? { ...item, cantidad_reembolso: Math.min(cantidad, item.cantidad) }
          : item
      )
    );
  };

  const calcularTotalReembolso = () => {
    return itemsReembolso.reduce((total, item) => 
      total + (item.cantidad_reembolso * item.precio_unitario), 0
    );
  };

  const procesarReembolso = async () => {
    if (!ventaSeleccionada) {
      toast.error('Seleccione una venta para procesar el reembolso');
      return;
    }

    const itemsAReembolsar = itemsReembolso.filter(item => item.cantidad_reembolso > 0);
    if (itemsAReembolsar.length === 0) {
      toast.error('Seleccione al menos un ítem para reembolsar');
      return;
    }

    if (!motivo) {
      toast.error('Ingrese un motivo para el reembolso');
      return;
    }

    try {
      const reembolsoData = {
        id_venta: ventaSeleccionada.id_venta,
        monto_reembolso: calcularTotalReembolso(),
        motivo,
        items: itemsAReembolsar.map(item => ({
          id_detalle_venta: item.id_detalle,
          cantidad_reembolsada: item.cantidad_reembolso,
          subtotal_reembolso: item.cantidad_reembolso * item.precio_unitario
        }))
      };

      await axios.post(`${URL}/reembolsos`, reembolsoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Reembolso procesado exitosamente');
      setVentaSeleccionada(null);
      setItemsReembolso([]);
      setMotivo('');
      obtenerVentas();
    } catch (error) {
      console.error('Error al procesar el reembolso:', error);
      toast.error('Error al procesar el reembolso');
    }
  };

  return (
  <div>
    <div className='reem'></div>
    <div className="reembolsos-container">
      <h1>Gestión de Reembolsos</h1>

      <div className="ventas-list">
        <h2>Seleccionar Venta</h2>
        <select onChange={(e) => seleccionarVenta(e.target.value)}>
          <option value="">Seleccione una venta</option>
          {ventas.map(venta => (
            <option key={venta.id_venta} value={venta.id_venta}>
              {venta.numero_comprobante} - {new Date(venta.fecha_venta).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {ventaSeleccionada && (
        <div className="venta-detalles">
          <h2>Detalles de la Venta</h2>
          <p>Comprobante: {ventaSeleccionada.numero_comprobante}</p>
          <p>Fecha: {new Date(ventaSeleccionada.fecha_venta).toLocaleString()}</p>
          <p>Cliente: {ventaSeleccionada.nombre_cliente || 'No registrado'}</p>
          <p>Total: Q{ventaSeleccionada.total_venta.toFixed(2)}</p>

          <table>
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
                <th>Cantidad a Reembolsar</th>
              </tr>
            </thead>
            <tbody>
              {itemsReembolso.map(item => (
                <tr key={item.id_detalle}>
                  <td>{item.nombre || `${item.tipo_item} ${item.id_item}`}</td>
                  <td>{item.cantidad}</td>
                  <td>Q{item.precio_unitario.toFixed(2)}</td>
                  <td>Q{item.subtotal.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={item.cantidad}
                      value={item.cantidad_reembolso}
                      onChange={(e) => actualizarCantidadReembolso(item.id_detalle, parseInt(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="reembolso-total">
            <p>Total a Reembolsar: Q{calcularTotalReembolso().toFixed(2)}</p>
          </div>

          <div className="reembolso-motivo">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del reembolso"
            />
          </div>

          <button onClick={procesarReembolso} className="procesar-reembolso-btn">Procesar Reembolso</button>
        </div>
      )}

      <ToastContainer />
    </div>
    </div>
  );
}