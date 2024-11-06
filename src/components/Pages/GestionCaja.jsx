import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/gestionCaja.css';

export default function GestionCaja() {
  const [cajaActual, setCajaActual] = useState(null);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [historial, setHistorial] = useState([]);

  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerCajaActual();
    obtenerHistorial();
  }, []);

  const obtenerCajaActual = async () => {
    try {
      const response = await axios.get(`${URL}/cajas/actual`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.ok && response.data.caja) {
        // Convertir los valores numéricos
        const cajaFormateada = {
          ...response.data.caja,
          monto_inicial: Number(response.data.caja.monto_inicial),
          monto_final: response.data.caja.monto_final ? Number(response.data.caja.monto_final) : null,
          total_ventas: Number(response.data.caja.total_ventas || 0),
          total_ventas_reales: Number(response.data.caja.total_ventas_reales || 0)
        };
        setCajaActual(cajaFormateada);
      } else {
        setCajaActual(null);
      }
    } catch (error) {
      console.error('Error al obtener la caja actual:', error);
      setCajaActual(null);
      if (!error.response?.status === 404) {
        toast.error('Error al obtener la información de la caja');
      }
    }
  };

  const obtenerHistorial = async () => {
    try {
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
  
      const formatoFecha = (fecha) => {
        return fecha.toISOString().split('T')[0];
      };
  
      const response = await axios.get(`${URL}/cajas/historial`, {
        params: {
          fecha_inicio: formatoFecha(fechaInicio),
          fecha_fin: formatoFecha(fechaFin)
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      if (response.data.ok) {
        // Convertir los valores numéricos
        const historialFormateado = response.data.historial.map(caja => ({
          ...caja,
          monto_inicial: Number(caja.monto_inicial),
          monto_final: caja.monto_final ? Number(caja.monto_final) : null,
          total_ventas: Number(caja.total_ventas || 0)
        }));
        setHistorial(historialFormateado);
      }
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      toast.error('Error al obtener el historial de cajas');
      setHistorial([]);
    }
  };

  const abrirCaja = async () => {
    try {
      if (!montoInicial || montoInicial <= 0) {
        toast.error('Por favor ingrese un monto inicial válido');
        return;
      }
  
      const response = await axios.post(`${URL}/cajas/abrir`, 
        { monto_inicial: parseFloat(montoInicial) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
  
      if (response.data.ok) {
        toast.success('Caja abierta exitosamente');
        setCajaActual(response.data.caja); // Actualizar directamente con la caja devuelta
        setMontoInicial('');
      } else {
        toast.error(response.data.msg || 'Error al abrir la caja');
      }
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      toast.error(error.response?.data?.msg || 'Error al abrir la caja');
    }
  };

  const cerrarCaja = async () => {
    try {
      if (!montoFinal || montoFinal <= 0) {
        toast.error('Por favor ingrese un monto final válido');
        return;
      }

      const response = await axios.post(`${URL}/cajas/cerrar`, {
        id_caja: cajaActual.id_caja,
        monto_final: parseFloat(montoFinal)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.ok) {
        toast.success('Caja cerrada exitosamente');
        setCajaActual(null);
        setMontoFinal('');
        obtenerHistorial();
      } else {
        toast.error(response.data.msg || 'Error al cerrar la caja');
      }
    } catch (error) {
      console.error('Error al cerrar la caja:', error);
      toast.error(error.response?.data?.msg || 'Error al cerrar la caja');
    }
  };

  return (
    <div>
      <div className='gesca'></div>
      <div className="gestion-caja-container">
        <h1 className="text-2xl font-bold mb-4">Gestión de Caja</h1>

        {!cajaActual ? (
          <div className="abrir-caja bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Abrir Caja</h2>
            <input
              type="number"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="Monto inicial"
              className="w-full p-2 border rounded mb-2"
            />
            <button onClick={abrirCaja} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Abrir Caja
            </button>
          </div>
        ) : (
          <div className="cerrar-caja bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Cerrar Caja</h2>
            <p>Caja abierta el: {new Date(cajaActual.fecha_apertura).toLocaleString()}</p>
            <p>Monto inicial: Q{Number(cajaActual.monto_inicial).toFixed(2)}</p>
            <p>Total ventas: Q{Number(cajaActual.total_ventas_reales || 0).toFixed(2)}</p>
            <input
              type="number"
              value={montoFinal}
              onChange={(e) => setMontoFinal(e.target.value)}
              placeholder="Monto final"
              className="w-full p-2 border rounded mb-2"
            />
            <button onClick={cerrarCaja} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
              Cerrar Caja
            </button>
          </div>
        )}

        <div className="historial-cajas mt-8">
          <h2 className="text-xl font-semibold mb-2">Historial de Cajas</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Fecha Apertura</th>
                <th className="border p-2">Fecha Cierre</th>
                <th className="border p-2">Monto Inicial</th>
                <th className="border p-2">Monto Final</th>
                <th className="border p-2">Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              {historial && historial.length > 0 ? (
                historial.map((caja) => (
                  <tr key={caja.id_caja} className="hover:bg-gray-100">
                    <td className="border p-2">{new Date(caja.fecha_apertura).toLocaleString()}</td>
                    <td className="border p-2">
                      {caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : 'Abierta'}
                    </td>
                    <td className="border p-2">
                      Q{Number(caja.monto_inicial).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {caja.monto_final ? `Q${Number(caja.monto_final).toFixed(2)}` : '-'}
                    </td>
                    <td className="border p-2">
                      Q{Number(caja.total_ventas_reales || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border p-2 text-center">No hay registros disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}