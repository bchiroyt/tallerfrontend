import { useState, useEffect, useRef } from 'react';
import { useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import '../styles/ventas.css';
import { FaSearch, FaBarcode, FaUser, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaMoneyBillWave } from 'react-icons/fa';

export default function Ventas() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cajaActual, setCajaActual] = useState(null);
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
    } catch (error) {
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

  const buscarCliente = async (nit) => {
    if (!nit) {
      setCliente(null);
      return;
    }
  
    try {
      const response = await axios.get(`${URL}/clientes/nit/${nit}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      if (response.data.ok) {
        setCliente(response.data.cliente);
      } else {
        setCliente(null);
        toast.warn('Cliente no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      if (error.response?.status === 404) {
        const confirmar = window.confirm('Cliente no encontrado. ¿Desea registrar un nuevo cliente?');
        if (confirmar) {
          const nombre = prompt('Ingrese el nombre del cliente:');
          if (nombre) {
            try {
              const nuevoCliente = await axios.post(`${URL}/clientes`, {
                nit: nit,
                nombre: nombre,
                email: '',
                direccion: '',
                telefono: ''
              }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
  
              if (nuevoCliente.data.ok) {
                setCliente(nuevoCliente.data.cliente);
                toast.success('Cliente registrado exitosamente');
              }
            } catch (error) {
              console.error('Error al crear el cliente:', error);
              toast.error('Error al registrar el cliente');
            }
          }
        }
      } else {
        toast.error('Error al buscar el cliente');
      }
    }
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
    <div className="pos-container">
      <div className='ven'></div>
      <h1 className="pos-title">Punto de Venta</h1>
      
      <div className="pos-layout">
        {/* Panel Izquierdo */}
        <div className="pos-left-panel">
          <div className="pos-barcode-section">
            <input
              ref={codigoBarraRef}
              type="text"
              placeholder="Escanear código de barras"
              onKeyPress={handleCodigoBarraKeyPress}
              className="pos-input"
            />
          </div>
          
          <div className="pos-search-section">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre"
              className="pos-input"
            />
            <button
              onClick={() => buscarProducto(busqueda)}
              className="pos-search-button"
            >
              <FaSearch /> Buscar
            </button>
          </div>
  
          <div className="pos-client-section">
            <input
              type="text"
              placeholder="NIT del cliente"
              onChange={(e) => buscarCliente(e.target.value)}
              className="pos-input"
            />
            {cliente && (
              <div className="pos-client-info">
                <p className="pos-client-name">Cliente: {cliente.nombre}</p>
                <p className="pos-client-nit">NIT: {cliente.nit}</p>
              </div>
            )}
          </div>
  
          {/* Nueva sección de pago en el panel izquierdo */}
          <div className="pos-payment-section">
            <h3 className="pos-payment-title">
              <FaMoneyBillWave /> Información de Pago
            </h3>
            <div className="pos-payment-details">
              <input
                type="number"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                placeholder="Monto recibido"
                className="pos-payment-input"
              />
              {parseFloat(montoRecibido) > 0 && (
                <div className="pos-change-container">
                  <span>Cambio:</span>
                  <span className="pos-change-amount">Q{calcularCambio().toFixed(2)}</span>
                </div>
              )}
            </div>
            <button
              onClick={realizarVenta}
              disabled={carrito.length === 0 || !montoRecibido || parseFloat(montoRecibido) < calcularTotal()}
              className="pos-complete-sale"
            >
              <FaMoneyBillWave /> COMPLETAR VENTA
            </button>
          </div>
        </div>
  
        {/* Panel Derecho - Solo Carrito y Total */}
        <div className="pos-right-panel">
          <div className="pos-cart-container">
            <h2 className="pos-cart-title">
              <FaShoppingCart /> Carrito de Compras
            </h2>
            
            <div className="pos-cart-items">
              {carrito.map(item => (
                <div key={`${item.tipo_item}-${item.id}`} className="pos-cart-item">
                  <div className="pos-item-details">
                    <p className="pos-item-name">{item.nombre}</p>
                    <p className="pos-item-stock">
                      {item.tipo_item === 'servicio' ? 'Servicio' : `Stock: ${item.stock}`}
                    </p>
                  </div>
                  <div className="pos-quantity-controls">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad - 1)}
                      className="pos-quantity-button"
                      disabled={item.cantidad <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="pos-quantity">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad + 1)}
                      className="pos-quantity-button"
                      disabled={item.tipo_item !== 'servicio' && item.cantidad >= item.stock}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="pos-item-subtotal">
                    <p>Q{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(item.id, item.tipo_item)}
                    className="pos-delete-button"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
  
            <div className="pos-cart-total">
              <span className="pos-total-label">Total:</span>
              <span className="pos-total-amount">Q{calcularTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
  
      <ToastContainer />
    </div>
  );
}