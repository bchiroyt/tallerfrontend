import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, 
  FaPlus, 
  FaReceipt, 
  FaStore, 
  FaCalendarAlt,
  FaCog,
  FaEye 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../styles/listacompras.module.css';

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
    <div className={styles.comprasContainer}>
      <div className={styles.licom}></div>
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          <FaShoppingCart className={styles.titleIcon} />
          Lista de Compras
        </h1>
        <Link to="/nueva-compra" className={styles.newButton}>
          <FaPlus className={styles.buttonIcon} />
          Nueva Compra
        </Link>
      </div>
  
      <div className={styles.tableWrapper}>
        <table className={styles.comprasTable}>
          <thead>
            <tr>
              <th>
                <FaReceipt className={styles.headerIcon} />
                Nº Comprobante
              </th>
              <th>
                <FaStore className={styles.headerIcon} />
                Proveedor
              </th>
              <th>
                <FaCalendarAlt className={styles.headerIcon} />
                Fecha
              </th>
              <th>
                <span className={styles.headerIcon}>Q</span>
                Total
              </th>
              <th>
                <FaCog className={styles.headerIcon} />
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id_compra}>
                <td>{compra.numero_comprobante}</td>
                <td>{compra.proveedor_nombre}</td>
                <td>{new Date(compra.fecha_facturacion).toLocaleDateString()}</td>
                <td className={styles.montoCell}>
                  Q{typeof compra.total_compra === 'number' 
                    ? compra.total_compra.toFixed(2) 
                    : Number(compra.total_compra).toFixed(2)}
                </td>
                <td>
                  <Link 
                    to={`/compras/${compra.id_compra}`} 
                    className={styles.detailButton}
                  >
                    <FaEye className={styles.buttonIcon} />
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaCompras;