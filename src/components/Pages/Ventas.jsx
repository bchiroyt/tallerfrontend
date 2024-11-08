import { useState, useEffect, useRef } from 'react';
import { useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import styles from '../styles/ventas.module.css';
import { FaSearch, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaMoneyBillWave } from 'react-icons/fa';

export default function Ventas() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cajaActual, setCajaActual] = useState(null);
  const [nitBusqueda, setNitBusqueda] = useState('');
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nit: '',
    nombre: ''    
  });
  
  const codigoBarraRef = useRef(null);

  
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    verificarCaja();
    codigoBarraRef.current?.focus();
  }, []);

  const verificarCaja = async () => {
    try {
      const response = await axios.get(`${URL}/cajas/actual`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.ok) {
        setCajaActual(response.data.caja);
      }
    } catch {
      toast.error('No hay una caja abierta');
      // Redirigir a la página de gestión de caja
      navigate('/GestionCaja');
    }
  };

  const buscarProducto = async (termino) => {
    try {
      const response = await axios.get(`${URL}/ventas/buscar`, {
        params: { termino },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.ok && response.data.productos.length > 0) {
        const producto = response.data.productos[0];
        agregarAlCarrito(producto);
      } else {
        toast.warn('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar producto:', error);
      toast.error('Error al buscar el producto');
    }
  };

  const handleBuscarCliente = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      try {
        const response = await axios.get(`${URL}/clientes/nit/${nitBusqueda}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.ok) {
          setCliente(response.data.cliente);
          setMostrarFormularioCliente(false);
          toast.success('Cliente encontrado');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setMostrarFormularioCliente(true);
          setNuevoCliente(prev => ({ ...prev, nit: nitBusqueda }));
        } else {
          toast.error('Error al buscar el cliente');
        }
      }
    }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${URL}/clientes`, {
        nit: nuevoCliente.nit,
        nombre: nuevoCliente.nombre,
        email: '',
        direccion: '',
        telefono: ''
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.ok) {
        setCliente(response.data.cliente);
        setMostrarFormularioCliente(false);
        toast.success('Cliente creado exitosamente');
      }
    } catch {
      toast.error('Error al crear el cliente');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prev => ({
        ...prev,
        [name]: value
    }));
};

  const agregarAlCarrito = (producto) => {
    if (producto.tipo_item !== 'servicio' && producto.stock <= 0) {
      toast.error('Producto sin stock disponible');
      return;
    }
  
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => 
        item.id === producto.id && item.tipo_item === producto.tipo_item
      );
  
      if (itemExistente) {
        if (producto.tipo_item !== 'servicio' && itemExistente.cantidad >= producto.stock) {
          toast.error('Stock insuficiente');
          return prevCarrito;
        }
  
        return prevCarrito.map(item =>
          item.id === producto.id && item.tipo_item === producto.tipo_item
            ? { 
                ...item, 
                cantidad: item.cantidad + 1, 
                subtotal: Number((item.cantidad + 1) * item.precio_venta) 
              }
            : item
        );
      }
  
      return [...prevCarrito, {
        ...producto,
        cantidad: 1,
        precio_venta: Number(producto.precio_venta),
        subtotal: Number(producto.precio_venta)
      }];
    });
  };


  const actualizarCantidad = (id, tipo_item, nuevaCantidad) => {
    setCarrito(prevCarrito =>
      prevCarrito.map(item => {
        if (item.id === id && item.tipo_item === tipo_item) {
          if (item.tipo_item !== 'servicio' && nuevaCantidad > item.stock) {
            toast.error('Stock insuficiente');
            return item;
          }
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: Number(nuevaCantidad * item.precio_venta)
          };
        }
        return item;
      })
    );
  };
  

  const eliminarDelCarrito = (id, tipo_item) => {
    setCarrito(prevCarrito => 
      prevCarrito.filter(item => !(item.id === id && item.tipo_item === tipo_item))
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const calcularCambio = () => {
    const total = calcularTotal();
    return montoRecibido ? parseFloat(montoRecibido) - total : 0;
  };

  const handleCodigoBarraKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      buscarProducto(e.target.value);
      e.target.value = '';
    }
  };

  const realizarVenta = async () => {
    try {
      if (!cajaActual) {
        toast.error('No hay una caja abierta');
        return;
      }

      if (carrito.length === 0) {
        toast.error('El carrito está vacío');
        return;
      }

      const total = calcularTotal();
      if (!montoRecibido || parseFloat(montoRecibido) < total) {
        toast.error('El monto recibido es insuficiente');
        return;
      }

      const ventaData = {
        id_cliente: cliente?.id_cliente,
        id_caja: cajaActual.id_caja,
        total_venta: total,
        monto_recibido: parseFloat(montoRecibido),
        items: carrito.map(item => ({
          tipo_item: item.tipo_item,
          id_item: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: item.subtotal
        }))
      };

      const response = await axios.post(`${URL}/ventas`, ventaData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      if (response.data.ok) {
        toast.success('Venta realizada con éxito');
        
        // Abrir el PDF en una nueva ventana
        if (response.data.venta.pdf_url) {
          window.open(`${URL}${response.data.venta.pdf_url}`, '_blank');
        }
        
        // Limpiar el carrito y otros estados
        setCarrito([]);
        setCliente(null);
        setMontoRecibido('');
        setBusqueda('');
        codigoBarraRef.current?.focus();
      }
    } catch (error) {
      console.error('Error al realizar la venta:', error);
      toast.error('Error al realizar la venta');
    }
  };

  if (!cajaActual) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl mb-4">No hay una caja abierta</h2>
        <button
          onClick={() => navigate('/GestionCaja')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ir a Gestión de Caja
        </button>
      </div>
    );
  }

  return (
    <div className={styles.posContainer}>
      <div className={styles.ven}></div>
      <h1 className={styles.posTitle}>Punto de Venta</h1>
      
      <div className={styles.posLayout}>
        {/* Panel Izquierdo */}
        <div className={styles.posLeftPanel}>
          <div className={styles.posBarcodeSection}>
            <input
              ref={codigoBarraRef}
              type="text"
              placeholder="Escanear código de barras"
              onKeyPress={handleCodigoBarraKeyPress}
              className={styles.posInput}
            />
          </div>
          
          <div className={styles.posSearchSection}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre"
              className={styles.posInput}
            />
            <button
              onClick={() => buscarProducto(busqueda)}
              className={styles.posSearchButton}
            >
              <FaSearch /> Buscar
            </button>
          </div>
  
          <div className={styles.posClientSection}>
            <input
              type="text"
              value={nitBusqueda}
              placeholder="Ingrese NIT y presione Enter"
              onChange={(e) => setNitBusqueda(e.target.value)}
              onKeyPress={handleBuscarCliente}
              className={styles.posInput}
            />
            {cliente && (
              <div className={styles.posClientInfo}>
                <p className={styles.posClientName}>Cliente: {cliente.nombre}</p>
                <p className={styles.posClientNit}>NIT: {cliente.nit}</p>
              </div>
            )}
          </div>
  
          <div className={styles.posPaymentSection}>
            <h3 className={styles.posPaymentTitle}>
              <FaMoneyBillWave /> Información de Pago
            </h3>
            <div className={styles.posPaymentDetails}>
              <input
                type="number"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                placeholder="Monto recibido"
                className={styles.posPaymentInput}
              />
              {parseFloat(montoRecibido) > 0 && (
                <div className={styles.posChangeContainer}>
                  <span>Cambio:</span>
                  <span className={styles.posChangeAmount}>Q{calcularCambio().toFixed(2)}</span>
                </div>
              )}
            </div>
            <button
              onClick={realizarVenta}
              disabled={carrito.length === 0 || !montoRecibido || parseFloat(montoRecibido) < calcularTotal()}
              className={styles.posCompleteSale}
            >
              <FaMoneyBillWave /> COMPLETAR VENTA
            </button>
          </div>
        </div>
  
        <div className={styles.posRightPanel}>
          <div className={styles.posCartContainer}>
            <h2 className={styles.posCartTitle}>
              <FaShoppingCart /> Carrito de Compras
            </h2>
            <div className={styles.posCartItems}>
              {carrito.map(item => (
                <div key={`${item.tipo_item}-${item.id}`} className={styles.posCartItem}>
                  <div className={styles.posItemDetails}>
                    <p className={styles.posItemName}>{item.nombre}</p>
                    <p className={styles.posItemStock}>
                      {item.tipo_item === 'servicio' ? 'Servicio' : `Stock: ${item.stock}`}
                    </p>
                  </div>
                  <div className={styles.posQuantityControls}>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad - 1)}
                      className={styles.posQuantityButton}
                      disabled={item.cantidad <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className={styles.posQuantity}>{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad + 1)}
                      className={styles.posQuantityButton}
                      disabled={item.tipo_item !== 'servicio' && item.cantidad >= item.stock}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className={styles.posItemSubtotal}>
                    <p>Q{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(item.id, item.tipo_item)}
                    className={styles.posDeleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
  
            <div className={styles.posCartTotal}>
              <span className={styles.posTotalLabel}>Total:</span>
              <span className={styles.posTotalAmount}>Q{calcularTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
  
      {mostrarFormularioCliente && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Nuevo Cliente</h2>
            <form onSubmit={handleCrearCliente} className={styles.clientForm}>
              <div className={styles.formGroup}>
                <label>NIT:</label>
                <input
                  type="text"
                  value={nuevoCliente.nit}
                  disabled
                  className={styles.inputDisabled}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoCliente.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre del cliente"
                  required
                  autoFocus
                />
              </div>
  
              <div className={styles.formButtons}>
                <button 
                  type="button" 
                  onClick={() => {
                    setMostrarFormularioCliente(false);
                    setNitBusqueda('');
                  }}
                  className={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      <ToastContainer />
    </div>
  );
}