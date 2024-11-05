import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
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
      setCajaActual(response.data.caja);
    } catch (error) {
      console.error('Error al obtener la caja actual:', error);
      if (error.response && error.response.status === 404) {
        // No hay caja abierta, esto es normal
        setCajaActual(null);
      } else {
        toast.error('Error al obtener la información de la caja');
      }
    }
  };

  const obtenerHistorial = async () => {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30); // Últimos 30 días
      const response = await axios.get(`${URL}/cajas/historial`, {
        params: {
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: new Date().toISOString()
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistorial(response.data.historial);
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      toast.error('Error al obtener el historial de cajas');
    }
  };

  const abrirCaja = async () => {
    try {
      await axios.post(`${URL}/cajas/abrir`, { monto_inicial: parseFloat(montoInicial) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Caja abierta exitosamente');
      obtenerCajaActual();
      setMontoInicial('');
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      toast.error('Error al abrir la caja');
    }
  };

  const cerrarCaja = async () => {
    try {
      await axios.post(`${URL}/cajas/cerrar`, {
        id_caja: cajaActual.id_caja,
        monto_final: parseFloat(montoFinal)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Caja cerrada exitosamente');
      setCajaActual(null);
      setMontoFinal('');
      obtenerHistorial();
    } catch (error) {
      console.error('Error al cerrar la caja:', error);
      toast.error('Error al cerrar la caja');
    }
  };

  return (
    <div> 
      <div className='gesca'></div>     
      <div className="gestion-caja-container">
        <h1>Gestión de Caja</h1>

        {!cajaActual ? (
          <div className="abrir-caja">
            <h2>Abrir Caja</h2>
            <input
              type="number"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="Monto inicial"
              className="monto-input"
            />
            <button onClick={abrirCaja} className="abrir-btn">Abrir Caja</button>
          </div>
        ) : (
          <div className="cerrar-caja">
            <h2>Cerrar Caja</h2>
            <p>Caja abierta el: {new Date(cajaActual.fecha_apertura).toLocaleString()}</p>
            <p>Monto inicial: Q{cajaActual.monto_inicial.toFixed(2)}</p>
            <p>Total ventas: Q{cajaActual.total_ventas.toFixed(2)}</p>
            <input
              type="number"
              value={montoFinal}
              onChange={(e) => setMontoFinal(e.target.value)}
              placeholder="Monto final"
              className="monto-input"
            />
            <button onClick={cerrarCaja} className="cerrar-btn">Cerrar Caja</button>
          </div>
        )}

        <div className="historial-cajas">
          <h2>Historial de Cajas</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha Apertura</th>
                <th>Fecha Cierre</th>
                <th>Monto Inicial</th>
                <th>Monto Final</th>
                <th>Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((caja) => (
                <tr key={caja.id_caja}>
                  <td>{new Date(caja.fecha_apertura).toLocaleString()}</td>
                  <td>{caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : 'Abierta'}</td>
                  <td>Q{caja.monto_inicial.toFixed(2)}</td>
                  <td>{caja.monto_final ? `Q${caja.monto_final.toFixed(2)}` : '-'}</td>
                  <td>Q{caja.total_ventas.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToastContainer />
      </div>
    </div>
  ); 
}