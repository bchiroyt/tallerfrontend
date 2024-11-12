import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  FaStore, FaCalendarAlt, FaListAlt, FaBarcode, FaBox,
  FaSearch, FaPlus, FaTrash, FaSave, FaTimes,
  FaReceipt, FaFileInvoice, FaMoneyBillWave  
} from 'react-icons/fa';
import styles from '../styles/nuevacompra.module.css';

const URL = import.meta.env.VITE_URL;

export default function NuevaCompra() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [compra, setCompra] = useState({
    id_proveedor: '',
    tipo_comprobante: 'Factura',
    serie: '',
    fecha_facturacion: new Date().toISOString().split('T')[0],
    detalles: []
  });
  const [productoActual, setProductoActual] = useState({
    tipo_producto: 'accesorio',
    id_producto: '',
    cantidad: 1,
    precio_unitario: 0,
    precio_venta: 0,
    nombre: '',
    seleccionado: false
  });
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await axios.get(`${URL}/proveedores`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProveedores(response.data.proveedores);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('No se pudieron cargar los proveedores');
    }
  };

  const handleInputChange = (e) => {
    setCompra({ ...compra, [e.target.name]: e.target.value });
  };

  const handleProductoChange = (e) => {
    setProductoActual({ ...productoActual, [e.target.name]: e.target.value });
  };

  const buscarProducto = async () => {
    if (busqueda.trim() === '') {
      setResultadosBusqueda([]);
      return;
    }
    try {
      const response = await axios.get(`${URL}/${productoActual.tipo_producto}s/buscar`, {
        params: { termino: busqueda },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      let resultados = [];
      if (response.data.ok) {
        resultados = response.data[productoActual.tipo_producto] ? [response.data[productoActual.tipo_producto]] : [];
      }
      
      setResultadosBusqueda(resultados);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      toast.error('Error al buscar productos');
      setResultadosBusqueda([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (busqueda.trim()) {
        buscarProducto();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, productoActual.tipo_producto]);

  const seleccionarProducto = (producto) => {
    
    const precioVenta = producto.precio_venta || producto.precio || 0;
    
    
    let idProducto;
    switch (productoActual.tipo_producto) {
      case 'accesorio':
        idProducto = producto.id_accesorio;
        break;
      case 'bicicleta':
        idProducto = producto.id_bicicleta;
        break;
      case 'producto':
        idProducto = producto.id_producto;
        break;
      default:
        idProducto = '';
    }

   
    setProductoActual({
      ...productoActual,
      id_producto: idProducto,
      nombre: producto.nombre,
      precio_unitario: producto.precio_costo || producto.precio_compra || 0,
      precio_venta: precioVenta,
      cantidad: 1, 
      seleccionado: true,
      codigo: producto.codigo || producto.codigo_barra || ''
    });

    
    toast.success(`${producto.nombre} seleccionado`);

    
    setBusqueda('');
    setResultadosBusqueda([]);
  };

  const agregarDetalle = () => {
    if (!productoActual.seleccionado) {
      toast.warning('Debe seleccionar un producto');
      return;
    }

    if (productoActual.cantidad <= 0) {
      toast.warning('La cantidad debe ser mayor a 0');
      return;
    }

    if (productoActual.precio_unitario <= 0) {
      toast.warning('El precio de compra debe ser mayor a 0');
      return;
    }

    if (productoActual.precio_venta <= 0) {
      toast.warning('El precio de venta debe ser mayor a 0');
      return;
    }

    const subtotal = productoActual.cantidad * productoActual.precio_unitario;
    
    setCompra(prevCompra => ({
      ...prevCompra,
      detalles: [...prevCompra.detalles, {
        ...productoActual,
        subtotal
      }]
    }));

    
    setProductoActual({
      tipo_producto: 'accesorio',
      id_producto: '',
      cantidad: 1,
      precio_unitario: 0,
      precio_venta: 0,
      nombre: '',
      seleccionado: false
    });
    setBusqueda('');

    toast.success('Producto agregado a la compra');
  };

  const eliminarDetalle = (index) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este producto de la compra?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setCompra(prevCompra => ({
          ...prevCompra,
          detalles: prevCompra.detalles.filter((_, i) => i !== index)
        }));
        toast.success('Producto eliminado de la compra');
      }
    });
  };

  const calcularTotal = () => {
    return compra.detalles.reduce((total, detalle) => {
      return total + (Number(detalle.cantidad) * Number(detalle.precio_unitario));
    }, 0);
  };

  const guardarCompra = async () => {
    
    console.log('Datos de la compra a enviar:', compra);
    
    
    if (!compra.id_proveedor) {
      toast.warning('Debe seleccionar un proveedor');
      return;
    }

    if (!compra.tipo_comprobante || !compra.serie) {
      toast.warning('Complete los datos del comprobante');
      return;
    }

    if (compra.detalles.length === 0) {
      toast.warning('Agregue al menos un producto a la compra');
      return;
    }

    try {
      const result = await Swal.fire({
        title: '¿Confirmar compra?',
        text: `Total a pagar: Q${calcularTotal().toFixed(2)}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
       
        const compraFormateada = {
          ...compra,
          detalles: compra.detalles.map(detalle => ({
            tipo_producto: detalle.tipo_producto,
            id_producto: detalle.id_producto,
            cantidad: Number(detalle.cantidad),
            precio_unitario: Number(detalle.precio_unitario),
            precio_venta: Number(detalle.precio_venta),
            subtotal: Number(detalle.subtotal)
          }))
        };

        console.log('Datos formateados:', compraFormateada);

        const response = await axios.post(`${URL}/compras`, compraFormateada, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.ok) {
          toast.success('Compra registrada exitosamente');
          
          
          if (response.data.compra?.pdf) {
            const pdfUrl = `${URL}${response.data.compra.pdf}`;
            window.open(pdfUrl, '_blank');
          }
          
          navigate('/ListaCompra');
        } else {
          throw new Error(response.data.msg || 'Error al guardar la compra');
        }
      }
    } catch (error) {
      console.error('Error detallado:', error);
      toast.error(error.response?.data?.msg || 'Error al guardar la compra');
    }
  };

  const cancelarCompra = async () => {
    const result = await Swal.fire({
      title: '¿Cancelar compra?',
      text: "Perderá todos los datos ingresados",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    });

    if (result.isConfirmed) {
      setCompra({
        id_proveedor: '',
        tipo_comprobante: 'Factura',
        serie: '',
        fecha_facturacion: new Date().toISOString().split('T')[0],
        detalles: []
      });
      
      setProductoActual({
        tipo_producto: 'accesorio',
        id_producto: '',
        cantidad: 1,
        precio_unitario: 0,
        precio_venta: 0,
        nombre: '',
        seleccionado: false
      });
      
      setBusqueda('');
      setResultadosBusqueda([]);
      
      navigate('/ListaCompra');
      toast.info('Compra cancelada');
    }
  };

  return (
    <div>
      <div className={styles.necom}></div> 
      <div className={styles.comprasContainer}>
        <h1 className={styles.comprasTitle}>
          <FaFileInvoice className={styles.titleIcon} />
          Nueva Compra
        </h1>
        
        <form className={styles.comprasForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaStore className={styles.labelIcon} />
              Proveedor
            </label>
            <select
              className={styles.select}
              name="id_proveedor"
              value={compra.id_proveedor}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un proveedor</option>
              {proveedores.map(proveedor => (
                <option key={`prov-${proveedor.id_proveedor}`} value={proveedor.id_proveedor}>
                  {proveedor.nombre_compañia}
                </option>
              ))}
            </select>
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaReceipt className={styles.labelIcon} />
              Tipo de Comprobante
            </label>
            <select
              className={styles.select}
              name="tipo_comprobante"
              value={compra.tipo_comprobante}
              onChange={handleInputChange}
              required
            >
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
              <option value="Recibo">Recibo</option>
            </select>
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaBarcode className={styles.labelIcon} />
              Serie
            </label>
            <input
              className={styles.input}
              type="text"
              name="serie"
              value={compra.serie}
              onChange={handleInputChange}
              required
            />
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaCalendarAlt className={styles.labelIcon} />
              Fecha de Facturación
            </label>
            <input
              className={styles.input}
              type="date"
              name="fecha_facturacion"
              value={compra.fecha_facturacion}
              onChange={handleInputChange}
              required
            />
          </div>
  
          <h2 className={styles.subtitle}>
            <FaPlus className={styles.subtitleIcon} />
            Agregar Producto
          </h2>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaBox className={styles.labelIcon} />
              Tipo de Producto
            </label>
            <select
              className={styles.select}
              name="tipo_producto"
              value={productoActual.tipo_producto}
              onChange={handleProductoChange}
            >
              <option value="accesorio">Accesorio</option>
              <option value="bicicleta">Bicicleta</option>
              <option value="producto">Producto</option>
            </select>
          </div>
  
          <div className={styles.searchGroup}>
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} />
              <input
                className={styles.input}
                type="text"
                placeholder="Buscar producto por nombre o código"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            {resultadosBusqueda.length > 0 && (
              <ul className={styles.searchResults}>
                {resultadosBusqueda.map((producto, index) => (
                  <li 
                    key={`search-${producto.id_producto || producto.id_accesorio || producto.id_bicicleta || index}`}
                    className={styles.searchItem}
                    onClick={() => seleccionarProducto(producto)}
                  >
                    <div className={styles.searchItemName}>{producto.nombre}</div>
                    <div className={styles.searchItemDetails}>
                      <FaBarcode className={styles.detailIcon} />
                      {producto.codigo || producto.codigo_barra || 'N/A'} - 
                      <FaMoneyBillWave className={styles.detailIcon} />
                      Q{Number(producto.precio_venta || 0).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaBox className={styles.labelIcon} />
              Cantidad
            </label>
            <input
              className={styles.input}
              type="number"
              name="cantidad"
              value={productoActual.cantidad}
              onChange={handleProductoChange}
              min="1"
            />
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FaMoneyBillWave className={styles.labelIcon} />
              Precio de Costo
            </label>

            <input
              className={styles.input}
              type="number"
              name="precio_unitario"
              value={productoActual.precio_unitario}
              onChange={handleProductoChange}
              min="0"
              step="0.01"
            />
          </div>
  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Q
              Precio de Venta
            </label>
            <input
              className={styles.input}
              type="number"
              name="precio_venta"
              value={productoActual.precio_venta}
              onChange={handleProductoChange}
              min="0"
              step="0.01"
            />
          </div>
  
          <button
            className={styles.addButton}
            type="button"
            onClick={agregarDetalle}
          >
            <FaPlus className={styles.buttonIcon} />
            Agregar a la compra
          </button>
  
          <h2 className={styles.subtitle}>
            <FaListAlt className={styles.subtitleIcon} />
            Detalles de la Compra
          </h2>
  
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio de Costo</th>
                  <th>Precio de Venta</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compra.detalles.map((detalle, index) => (
                  <tr key={`detail-${detalle.id_producto}-${index}`}>
                    <td>{detalle.tipo_producto}</td>
                    <td>{detalle.nombre}</td>
                    <td>{detalle.cantidad}</td>
                    <td>Q{Number(detalle.precio_unitario).toFixed(2)}</td>
                    <td>Q{Number(detalle.precio_venta).toFixed(2)}</td>
                    <td>Q{Number(detalle.subtotal).toFixed(2)}</td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                      >
                        <FaTrash className={styles.buttonIcon} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className={styles.totalLabel}>Total:</td>
                  <td className={styles.totalAmount}>
                    <FaMoneyBillWave className={styles.totalIcon} />
                    Q{calcularTotal().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
  
          <div className={styles.formActions}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              type="button"
              onClick={cancelarCompra}
            >
              <FaTimes className={styles.buttonIcon} />
              Cancelar Compra
            </button>
            <button
              className={`${styles.button} ${styles.saveButton}`}
              type="button"
              onClick={guardarCompra}
            >
              <FaSave className={styles.buttonIcon} />
              Guardar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}