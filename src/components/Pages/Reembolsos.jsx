import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../styles/reembolsos.module.css';

export default function Reembolsos() {
  const { id_venta } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [itemsReembolso, setItemsReembolso] = useState([]);
  const [motivo, setMotivo] = useState('');
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    if (id_venta) {
      cargarVenta();
    }
  }, [id_venta]);

  const cargarVenta = async () => {
    try {
      const response = await axios.get(`${URL}/ventas/${id_venta}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.ok && response.data.venta) {
        setVenta(response.data.venta);
        
        
        const detalles = response.data.venta.items || [];
        
        
        const itemsReembolsables = detalles.filter(
          item => item.tipo_item !== 'servicio' && 
          item.cantidad > (item.cantidad_reembolsada || 0)
        );

        setItemsReembolso(itemsReembolsables.map(item => ({
          ...item,
          cantidad_reembolso: 0
        })));
      }
    } catch (error) {
      console.error('Error al cargar la venta:', error);
      toast.error('Error al cargar los detalles de la venta');
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
    if (!motivo.trim()) {
      toast.warning('Debe especificar un motivo para el reembolso');
      return;
    }

    const itemsAReembolsar = itemsReembolso.filter(item => item.cantidad_reembolso > 0);
    if (itemsAReembolsar.length === 0) {
      toast.warning('Seleccione al menos un ítem para reembolsar');
      return;
    }

    try {
      const reembolsoData = {
        id_venta: venta.id_venta,
        monto_reembolso: calcularTotalReembolso(),
        motivo,
        items: itemsAReembolsar.map(item => ({
          id_detalle_venta: item.id_detalle,
          tipo_item: item.tipo_item,
          id_item: item.id_item,
          cantidad_reembolsada: item.cantidad_reembolso,
          subtotal_reembolso: item.cantidad_reembolso * item.precio_unitario
        }))
      };

      const response = await axios.post(`${URL}/reembolsos`, reembolsoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.ok) {
        toast.success('Reembolso procesado exitosamente');
        navigate('/ventas');
      }
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      toast.error('Error al procesar el reembolso');
    }
  };

  return (
    <div className={styles.reembolsoContainer}>
      <div className={styles.reem}></div>
      <div className={styles.headerBar}>
        <button
          onClick={() => navigate('/ventas')}
          className={styles.backButton}
        >
          <FaArrowLeft className={styles.backIcon} /> 
          <span>Volver a Ventas</span>
        </button>
        <button
          onClick={() => navigate('/listaventas')}
          className={styles.backButton}
        >
          <FaArrowLeft className={styles.backIcon} /> 
          <span>Lista Ventas </span>
        </button>
        <h1 className={styles.pageTitle}>Reembolso de Venta</h1>
      </div>
  
      {venta && (
        <div className={styles.ventaDetailsCard}>
          <h2 className={styles.cardTitle}>Detalles de la Venta</h2>
          <div className={styles.ventaInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Comprobante:</span>
              <span className={styles.infoValue}>{venta.numero_comprobante}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha:</span>
              <span className={styles.infoValue}>
                {new Date(venta.fecha_venta).toLocaleString()}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cliente:</span>
              <span className={styles.infoValue}>
                {venta.nombre_cliente || 'Cliente General'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Original:</span>
              <span className={`${styles.infoValue} ${styles.montoOriginal}`}>
                Q{Number(venta.total_venta).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
  
      {itemsReembolso.length > 0 ? (
        <div className={styles.reembolsoCard}>
          <h3 className={styles.cardTitle}>Ítems Disponibles para Reembolso</h3>
          <div className={styles.tableContainer}>
            <table className={styles.reembolsoTable}>
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
                    <td className={styles.centeredCell}>{item.cantidad}</td>
                    <td className={styles.centeredCell}>
                      <input
                        type="number"
                        min="0"
                        max={item.cantidad}
                        value={item.cantidad_reembolso}
                        onChange={(e) => actualizarCantidadReembolso(item.id_detalle, parseInt(e.target.value) || 0)}
                        className={styles.cantidadInput}
                      />
                    </td>
                    <td className={styles.montoCell}>
                      Q{Number(item.precio_unitario).toFixed(2)}
                    </td>
                    <td className={styles.montoCell}>
                      Q{(item.cantidad_reembolso * Number(item.precio_unitario)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <div className={styles.motivoSection}>
            <label className={styles.motivoLabel}>Motivo del Reembolso:</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={styles.motivoInput}
              rows="3"
              placeholder="Ingrese el motivo del reembolso"
            />
          </div>
  
          <div className={styles.footerSection}>
            <div className={styles.totalReembolso}>
              Total a Reembolsar: 
              <span className={styles.montoTotal}>
                Q{calcularTotalReembolso().toFixed(2)}
              </span>
            </div>
            <button
              onClick={procesarReembolso}
              className={styles.procesarButton}
              disabled={calcularTotalReembolso() <= 0 || !motivo.trim()}
            >
              Procesar Reembolso
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyMessage}>
            No hay ítems disponibles para reembolso en esta venta.
          </div>
        </div>
      )}
  
      <ToastContainer />
    </div>
  );
}