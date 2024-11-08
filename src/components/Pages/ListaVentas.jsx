import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaFilePdf, FaUndo, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/listaVentas.module.css';

Modal.setAppElement('#root');

const ListaVentas = () => {

  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    obtenerVentas();
  }, []);

  const obtenerVentas = async () => {
    try {
      const response = await axios.get(`${URL}/ventas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.ok) {
        setVentas(response.data.ventas);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      toast.error('Error al obtener las ventas');
    }
  };

  const verDetalleVenta = async (id_venta) => {
    try {
      const response = await axios.get(`${URL}/ventas/${id_venta}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.ok) {
        setVentaSeleccionada(response.data.venta);
        setModalIsOpen(true);
      }
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      toast.error('Error al obtener los detalles');
    }
  };

  const filtrarVentas = () => {
    return ventas.filter(venta => {
      const numeroComprobante = venta.numero_comprobante || '';
      return !filtroCodigo || 
        numeroComprobante.toLowerCase().includes(filtroCodigo.toLowerCase());
    });
  };

  const verPDF = (pdfUrl) => {
    window.open(`${URL}${pdfUrl}`, '_blank');
  };

  const iniciarReembolso = (venta) => {
    if (venta.tipo_venta === 'servicio') {
      toast.warning('No se pueden reembolsar servicios');
      return;
    }
    navigate(`/reembolsos/${venta.id_venta}`);
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.liven}></div>
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>Historial de Ventas</h1>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              placeholder="Buscar por No. Comprobante"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>
  
      <div className={styles.tableWrapper}>
        <table className={styles.ventasTable}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Comprobante</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarVentas().map(venta => (
              <tr key={venta.id_venta}>
                <td>{new Date(venta.fecha_venta).toLocaleString()}</td>
                <td>{venta.numero_comprobante}</td>
                <td>{venta.nombre_cliente || 'Cliente General'}</td>
                <td className={styles.montoCell}>
                  Q{Number(venta.total_venta).toFixed(2)}
                </td>
                <td>
                  <span className={`${styles.estadoBadge} ${venta.estado_venta ? styles.estadoActivo : styles.estadoReembolsado}`}>
                    {venta.estado_venta ? 'Activa' : 'Reembolsada'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => verDetalleVenta(venta.id_venta)}
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      title="Ver Detalles"
                    >
                      <FaEye />
                    </button>
                    {venta.pdf_url && (
                      <button
                        onClick={() => verPDF(venta.pdf_url)}
                        className={`${styles.actionButton} ${styles.pdfButton}`}
                        title="Ver PDF"
                      >
                        <FaFilePdf />
                      </button>
                    )}
                    {venta.estado_venta && venta.tipo_venta !== 'servicio' && (
                      <button
                        onClick={() => iniciarReembolso(venta)}
                        className={`${styles.actionButton} ${styles.refundButton}`}
                        title="Reembolsar"
                      >
                        <FaUndo />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
      >
        {ventaSeleccionada && (
          <div className={styles.modalBody}>
            <h2 className={styles.modalTitle}>Detalle de Venta</h2>
            
            <div className={styles.ventaInfo}>
              <div className={styles.infoColumn}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>No. Comprobante:</span>
                  <span className={styles.infoValue}>{ventaSeleccionada.numero_comprobante}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha:</span>
                  <span className={styles.infoValue}>
                    {new Date(ventaSeleccionada.fecha_venta).toLocaleString()}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cliente:</span>
                  <span className={styles.infoValue}>
                    {ventaSeleccionada.nombre_cliente || 'Cliente General'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>NIT:</span>
                  <span className={styles.infoValue}>{ventaSeleccionada.nit || 'C/F'}</span>
                </div>
              </div>
              
              <div className={styles.infoColumn}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total:</span>
                  <span className={`${styles.infoValue} ${styles.montoDestacado}`}>
                    Q{Number(ventaSeleccionada.total_venta).toFixed(2)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Efectivo:</span>
                  <span className={styles.infoValue}>
                    Q{Number(ventaSeleccionada.monto_recibido).toFixed(2)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cambio:</span>
                  <span className={styles.infoValue}>
                    Q{Number(ventaSeleccionada.cambio).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
  
            <div className={styles.detallesTable}>
              <table>
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaSeleccionada.items.map((item, index) => (
                    <tr key={index}>
                      <td>{`${item.tipo_item} #${item.id_item}`}</td>
                      <td className={styles.centrado}>{item.cantidad}</td>
                      <td className={styles.montoCell}>
                        Q{Number(item.precio_unitario).toFixed(2)}
                      </td>
                      <td className={styles.montoCell}>
                        Q{Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            <button
              onClick={() => setModalIsOpen(false)}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
        )}
      </Modal>
  
      <ToastContainer />
    </div>
  );
};

export default ListaVentas;