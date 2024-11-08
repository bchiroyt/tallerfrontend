import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaFileInvoice, 
  FaInfoCircle, 
  FaReceipt, 
  FaStore, 
  FaCalendarAlt, 
  FaDollarSign,
  FaListAlt,
  FaFilePdf,
  FaBarcode,
  FaBox,
  FaShoppingCart
} from 'react-icons/fa';
import styles from '../styles/detallecompra.module.css';

const URL = import.meta.env.VITE_URL;

const DetalleCompra = () => {
  const [compra, setCompra] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const { id } = useParams();

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
    return <div className={styles.loadingContainer}>Cargando...</div>;
  }

  return (
    <div className={styles.detalleContainer}>
      <div className={styles.decom}></div>
      <div className={styles.headerSection}>
        <Link to="/ListaCompra" className={styles.backButton}>
          <FaArrowLeft className={styles.buttonIcon} />
          Volver a Compras
        </Link>
        <h1 className={styles.mainTitle}>
          <FaFileInvoice className={styles.titleIcon} />
          Detalle de Compra
        </h1>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <FaInfoCircle className={styles.cardIcon} />
            Información de la Compra
          </h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaReceipt className={styles.infoIcon} />
                Nº Comprobante:
              </span>
              <span className={styles.infoValue}>{compra.numero_comprobante}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaFileInvoice className={styles.infoIcon} />
                Tipo de Comprobante:
              </span>
              <span className={styles.infoValue}>{compra.tipo_comprobante}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaBarcode className={styles.infoIcon} />
                Serie:
              </span>
              <span className={styles.infoValue}>{compra.serie}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaStore className={styles.infoIcon} />
                Proveedor:
              </span>
              <span className={styles.infoValue}>{compra.proveedor_nombre}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaCalendarAlt className={styles.infoIcon} />
                Fecha:
              </span>
              <span className={styles.infoValue}>
                {new Date(compra.fecha_facturacion).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaDollarSign className={styles.infoIcon} />
                Total:
              </span>
              <span className={styles.infoValue}>
                Q{Number(compra.total_compra).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.detallesCard}>
          <h2 className={styles.cardTitle}>
            <FaListAlt className={styles.cardIcon} />
            Detalle de Productos
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.detallesTable}>
              <thead>
                <tr>
                  <th><FaBarcode className={styles.headerIcon} /> Código</th>
                  <th><FaBox className={styles.headerIcon} /> Producto</th>
                  <th><FaShoppingCart className={styles.headerIcon} /> Tipo</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Precio Venta</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id_detalle}>
                    <td>{detalle.codigo_producto}</td>
                    <td>{detalle.nombre_producto}</td>
                    <td>{detalle.tipo_producto}</td>
                    <td className={styles.cantidadCell}>{detalle.cantidad}</td>
                    <td className={styles.montoCell}>Q{Number(detalle.precio_unitario).toFixed(2)}</td>
                    <td className={styles.montoCell}>Q{Number(detalle.precio_venta).toFixed(2)}</td>
                    <td className={styles.montoCell}>Q{Number(detalle.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {compra?.pdf && (
          <div className={styles.pdfSection}>
            <a 
              href={`${URL}${compra.pdf}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.pdfButton}
            >
              <FaFilePdf className={styles.buttonIcon} />
              Ver Factura PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleCompra;