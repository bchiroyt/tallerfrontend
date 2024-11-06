import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/reembolsos.css';

export default function Reembolsos() {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [itemsReembolso, setItemsReembolso] = useState([]);
  const [motivo, setMotivo] = useState('');
  const [cajaActual, setCajaActual] = useState(null);
  const navigate = useNavigate();

  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerCajaActual();
    obtenerVentas();
  }, []);

  const obtenerCajaActual = async () => {
    try {
      const response = await axios.get(`${URL}/cajas/actual`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.ok) {
        setCajaActual(response.data.caja);
      }
    } catch (error) {
      console.error('Error al obtener caja actual:', error);
    }
  };

  const obtenerVentas = async () => {
    try {
      if (!cajaActual) return;
      
      const response = await axios.get(`${URL}/ventas/caja/${cajaActual.id_caja}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Verificar que las ventas tengan detalles antes de filtrar
      const ventasFiltradas = response.data.ventas.filter(venta => 
        venta.estado_venta && 
        venta.detalles && 
        Array.isArray(venta.detalles) && 
        !venta.detalles.every(d => d.tipo_item === 'servicio')
      );
      
      setVentas(ventasFiltradas);
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
      toast.error('Error al obtener las ventas');
    }
  };

  const seleccionarVenta = async (id_venta) => {
    try {
      const venta = ventas.find(v => v.id_venta === parseInt(id_venta));
      if (!venta) return;

      setVentaSeleccionada(venta);
      // Filtrar items que no sean servicios
      const itemsParaReembolso = venta.detalles
        .filter(item => item.tipo_item !== 'servicio')
        .map(item => ({
          ...item,
          cantidad_reembolso: 0,
          subtotal_reembolso: 0
        }));
      setItemsReembolso(itemsParaReembolso);
    } catch (error) {
      console.error('Error al obtener detalles de la venta:', error);
      toast.error('Error al obtener los detalles');
    }
  };

  const actualizarCantidadReembolso = (id_detalle, cantidad) => {
    setItemsReembolso(prevItems =>
      prevItems.map(item => {
        if (item.id_detalle === id_detalle) {
          const cantidadFinal = Math.min(Math.max(0, cantidad), item.cantidad);
          return {
            ...item,
            cantidad_reembolso: cantidadFinal,
            subtotal_reembolso: cantidadFinal * item.precio_unitario
          };
        }
        return item;
      })
    );
  };

  const procesarReembolso = async () => {
    try {
      if (!motivo) {
        toast.error('Por favor ingrese un motivo para el reembolso');
        return;
      }

      const itemsAReembolsar = itemsReembolso.filter(item => item.cantidad_reembolso > 0);
      if (itemsAReembolsar.length === 0) {
        toast.error('Seleccione al menos un ítem para reembolsar');
        return;
      }

      const reembolsoData = {
        id_venta: ventaSeleccionada.id_venta,
        monto_reembolso: calcularTotalReembolso(),
        motivo,
        items: itemsAReembolsar.map(item => ({
          id_detalle_venta: item.id_detalle,
          cantidad_reembolsada: item.cantidad_reembolso,
          subtotal_reembolso: item.subtotal_reembolso
        }))
      };

      const response = await axios.post(`${URL}/reembolsos`, reembolsoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.ok) {
        toast.success('Reembolso procesado exitosamente');
        setVentaSeleccionada(null);
        setItemsReembolso([]);
        setMotivo('');
        obtenerVentas();
      }
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      toast.error('Error al procesar el reembolso');
    }
  };

  const calcularTotalReembolso = () => {
    return itemsReembolso.reduce((total, item) => 
      total + item.subtotal_reembolso, 0
    );
  };

  if (!cajaActual) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">No hay una caja abierta</h2>
        <button
          onClick={() => navigate('/caja')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ir a Gestión de Caja
        </button>
      </div>
    );
  }

  return (
    <div className="reembolsos-container">
      <div className='reem'></div>
      <h1 className="text-2xl font-bold mb-4">Reembolsos</h1>

      <div className="ventas-list mb-4">
        <select 
          onChange={(e) => seleccionarVenta(e.target.value)}
          value={ventaSeleccionada?.id_venta || ''}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccione una venta</option>
          {ventas.map(venta => (
            <option key={venta.id_venta} value={venta.id_venta}>
              {venta.numero_comprobante} - Q{venta.total_venta} 
              ({new Date(venta.fecha_venta).toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {ventaSeleccionada && (
        <div className="venta-detalles bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Detalles del Reembolso</h2>
          
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Cantidad Original</th>
                <th>Cantidad a Reembolsar</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itemsReembolso.map(item => (
                <tr key={item.id_detalle}>
                  <td>{item.nombre || `${item.tipo_item} #${item.id_item}`}</td>
                  <td className="text-center">{item.cantidad}</td>
                  <td className="text-center">
                    <input
                      type="number"
                      min="0"
                      max={item.cantidad}
                      value={item.cantidad_reembolso}
                      onChange={(e) => actualizarCantidadReembolso(item.id_detalle, parseInt(e.target.value))}
                      className="w-20 p-1 border rounded text-center"
                    />
                  </td>
                  <td className="text-right">Q{item.precio_unitario.toFixed(2)}</td>
                  <td className="text-right">Q{item.subtotal_reembolso.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-reembolso text-right mb-4">
            <strong>Total a Reembolsar: Q{calcularTotalReembolso().toFixed(2)}</strong>
          </div>

          <div className="motivo-reembolso mb-4">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del reembolso"
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <button
            onClick={procesarReembolso}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={calcularTotalReembolso() <= 0 || !motivo}
          >
            Procesar Reembolso
          </button>
        </div>
      )}
    </div>
  );
}