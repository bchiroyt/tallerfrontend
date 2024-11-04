import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/listacompras.css';

const URL = import.meta.env.VITE_URL;

const ListaCompras = () => {
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${URL}/compras`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompras(response.data.compras);
      } catch (error) {
        console.error('Error al obtener las compras:', error);
      }
    };

    fetchCompras();
  }, []);

  return (
    <div className="compras-container">
      <div className='licom'></div>
      <h1 className="compras-title">Lista de Compras</h1>
      <Link to="/nueva-compra" className="compras-button mb-4 inline-block">
        Nueva Compra
      </Link>
      <table className="compras-table">
        <thead>
          <tr>
            <th>Nº Comprobante</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id_compra}>
              <td>{compra.numero_comprobante}</td>
              <td>{compra.proveedor_nombre}</td>
              <td>{new Date(compra.fecha_facturacion).toLocaleDateString()}</td>
              <td>
                ${typeof compra.total_compra === 'number' 
                  ? compra.total_compra.toFixed(2) 
                  : Number(compra.total_compra).toFixed(2)}
              </td>
              <td>
                <Link to={`/compras/${compra.id_compra}`} className="budet">
                  Ver detalles
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaCompras;