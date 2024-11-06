import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import '../styles/ventas.css';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cajaActual, setCajaActual] = useState(null);
  const codigoBarraRef = useRef(null);
  const [nitCliente, setNitCliente] = useState('');

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
      setCajaActual(response.data.caja);
    } catch (error) {
      toast.error('No hay una caja abierta');
    }
  };

  const buscarProducto = async (codigo) => {
    try {
      const response = await axios.get(`${URL}/productos/buscar?termino=${codigo}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.producto) {
        // Asegurar que los valores numéricos sean números
        const productoFormateado = {
          ...response.data.producto,
          precio_venta: Number(response.data.producto.precio_venta)
        };
        agregarAlCarrito(productoFormateado);
      }
    } catch (error) {
      toast.error('Producto no encontrado');
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
      }
    } catch (error) {
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
        console.error('Error al buscar el cliente:', error);
        toast.error('Error al buscar el cliente');
      }
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => 
        item.id === producto.id && item.tipo_item === producto.tipo_item
      );
  
      if (itemExistente) {
        return prevCarrito.map(item =>
          item.id === producto.id && item.tipo_item === producto.tipo_item
            ? { 
                ...item, 
                cantidad: item.cantidad + 1,
                subtotal: Number(item.precio_venta) * (item.cantidad + 1)
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
  

  const eliminarDelCarrito = (id, tipo_item) => {
    setCarrito(prevCarrito => 
      prevCarrito.filter(item => !(item.id === id && item.tipo_item === tipo_item))
    );
  };

  const actualizarCantidad = (id, tipo_item, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setCarrito(prevCarrito =>
      prevCarrito.map(item =>
        item.id === id && item.tipo_item === tipo_item
          ? { 
              ...item, 
              cantidad: nuevaCantidad, 
              subtotal: Number(item.precio_venta) * nuevaCantidad 
            }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + Number(item.subtotal), 0);
  };

  const calcularCambio = () => {
    const total = calcularTotal();
    return montoRecibido ? montoRecibido - total : 0;
  };

  const handleCodigoBarraKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarProducto(e.target.value);
      e.target.value = '';
    }
  };

  const realizarVenta = async () => {
    if (!cajaActual) {
      toast.error('No hay una caja abierta');
      return;
    }

    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!montoRecibido || parseFloat(montoRecibido) < calcularTotal()) {
      toast.error('El monto recibido es insuficiente');
      return;
    }

    try {
      const ventaData = {
        id_cliente: cliente?.id_cliente,
        total_venta: calcularTotal(),
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

      toast.success('Venta realizada con éxito');
      // Abrir el PDF en una nueva ventana
      window.open(`${URL}${response.data.venta.pdf_url}`, '_blank');
      
      // Limpiar el estado
      setCarrito([]);
      setCliente(null);
      setMontoRecibido('');
      setBusqueda('');
      codigoBarraRef.current?.focus();
    } catch (error) {
      toast.error('Error al realizar la venta');
      console.error(error);
    }
  };

  return (
    <div> 
      <div className="vent"></div>
      <div className="ventas-container">
        <h1>Módulo de Ventas</h1>
        
        <div className="busqueda-container">
          <input
            ref={codigoBarraRef}
            type="text"
            placeholder="Escanear código de barras"
            onKeyPress={handleCodigoBarraKeyPress}
            className="codigo-barra-input"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto por nombre"
            className="busqueda-input"
          />
          <button onClick={() => buscarProducto(busqueda)} className="buscar-btn">Buscar</button>
        </div>

        <div className="cliente-container">
          <div className="cliente-busqueda">
            <input
              type="text"
              value={nitCliente}
              onChange={(e) => {
                setNitCliente(e.target.value);
                if (e.target.value === '') {
                  setCliente(null);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  buscarCliente(nitCliente);
                }
              }}
              placeholder="NIT del cliente (presione Enter)"
              className="nit-input"
            />
            <button 
              onClick={() => buscarCliente(nitCliente)}
              className="buscar-cliente-btn"
            >
              Buscar
            </button>
          </div>
          {cliente && (
            <div className="cliente-info">
              <p>NIT: {cliente.nit}</p>
              <p>Cliente: {cliente.nombre}</p>
            </div>
          )}
        </div>

        <div className="carrito-container">
          <h2>Carrito de Compras</h2>
          {carrito.map(item => (
            <div key={`${item.tipo_item}-${item.id}`} className="carrito-item">
              <span className="item-nombre">{item.nombre}</span>
              <div className="item-cantidad">
                <button onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad - 1)}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => actualizarCantidad(item.id, item.tipo_item, item.cantidad + 1)}>+</button>
              </div>
              <span className="item-subtotal">
                Q{Number(item.subtotal).toFixed(2)}
              </span>
              <button onClick={() => eliminarDelCarrito(item.id, item.tipo_item)} className="eliminar-btn">Eliminar</button>
            </div>
          ))}
          <div className="total">Total: Q{calcularTotal().toFixed(2)}</div>
        </div>

        <div className="pago-container">
          <input
            type="number"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            placeholder="Monto recibido"
            className="monto-input"
          />
          <div className="cambio">Cambio: Q{calcularCambio().toFixed(2)}</div>
          <button onClick={realizarVenta} className="realizar-venta-btn">VALIDAR</button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}