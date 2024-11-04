import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import '../styles/listaventas.css';

const ListaVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');

  const token = localStorage.getItem('token');
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerVentas();
  }, [filtroFecha]);

  const obtenerVentas = async () => {
    try {
      let endpoint = `${URL}/ventas`;
      if (filtroFecha) {
        endpoint += `?fecha=${filtroFecha}`;
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.ok) {
        setVentas(response.data.ventas);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      toast.error('Error al obtener las ventas');
    }
  };

  const descargarPDF = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="lista-ventas-container">
      <h1>Lista de Ventas</h1>
      <div className="filtro-fecha">
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        <button onClick={obtenerVentas}>Filtrar</button>
      </div>
      <table className="ventas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(venta => (
            <tr key={venta.id_venta}>
              <td>{venta.id_venta}</td>
              <td>{new Date(venta.fecha_venta).toLocaleString()}</td>
              <td>{venta.cliente_nombre || 'Cliente General'}</td>
              <td>${venta.total_venta}</td>
              <td>
                <Link to={`/ventas/${venta.id_venta}`}>Ver Detalle</Link>
                <button onClick={() => descargarPDF(venta.pdf_url)}>Descargar PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default ListaVentas;