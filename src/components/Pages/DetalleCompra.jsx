import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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
  FaShoppingCart,
  FaPrint
} from 'react-icons/fa';
import styles from '../styles/detallecompra.module.css';

const URL = import.meta.env.VITE_URL;

const DetalleCompra = () => {
  const [compra, setCompra] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompra();
  }, [id]);

  const fetchCompra = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No hay sesión activa');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${URL}/compras/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ok) {
        setCompra(response.data.compra);
        setDetalles(response.data.detalles);
        toast.success('Detalles de compra cargados');
      } else {
        throw new Error('Error al cargar los detalles');
      }
    } catch (error) {
      console.error('Error al obtener los detalles de la compra:', error);
      setError(error.response?.data?.mensaje || 'Error al cargar los detalles de la compra');
      toast.error('Error al cargar los detalles de la compra');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!compra?.pdf) {
      toast.error('No hay PDF disponible para esta compra');
      return;
    }

    try {
      const pdfUrl = `${URL}${compra.pdf}`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      toast.error('Error al abrir el PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      Swal.fire({
        title: 'Exportar a Excel',
        text: '¿Desea exportar los detalles a Excel?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, exportar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
        
          toast.info('Función de exportación a Excel en desarrollo');
        }
      });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar a Excel');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando detalles de la compra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error al cargar los detalles</h2>
        <p>{error}</p>
        <Link to="/ListaCompra" className={styles.backButton}>
          <FaArrowLeft className={styles.buttonIcon} />
          Volver a Compras
        </Link>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className={styles.errorContainer}>
        <h2>Compra no encontrada</h2>
        <Link to="/ListaCompra" className={styles.backButton}>
          <FaArrowLeft className={styles.buttonIcon} />
          Volver a Compras
        </Link>
      </div>
    );
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
          Detalle de Compra #{compra.numero_comprobante}
        </h1>
        <div className={styles.actionButtons}>
          {compra?.pdf && (
            <button 
              onClick={handlePrintPDF}
              className={styles.pdfButton}
            >
              <FaPrint className={styles.buttonIcon} />
              Imprimir PDF
            </button>
          )}

        </div>
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
              <span className={styles.infoValue}>
                {compra.tipo_comprobante} {compra.serie}-{compra.numero_comprobante}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <FaStore className={styles.infoIcon} />
                Proveedor:
              </span>
              <span className={styles.infoValue}>
                {compra.proveedor_nombre}
              </span>
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
                {detalles.map((detalle, index) => (
                  <tr key={`${detalle.id_detalle_compra}-${index}`}>
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
              <tfoot>
                <tr key="footer-row">
                  <td colSpan="6" className={styles.totalLabel}>Total:</td>
                  <td className={styles.totalAmount}>
                    Q{Number(compra.total_compra).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
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