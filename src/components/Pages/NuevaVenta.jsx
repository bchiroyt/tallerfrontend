import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/nuevaventa.css';

const NuevaVenta = () => {
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem('token');
  const URL = import.meta.env.VITE_URL;

  useEffect(() => {
    calcularTotal();
  }, [carrito]);

  const buscarCliente = async (nit) => {
    try {
      const response = await axios.get(`${URL}/clientes/buscar?nit=${nit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.ok) {
        setCliente(response.data.cliente);
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      toast.error('Cliente no encontrado');
    }
  };

  const buscarProducto = async () => {
    try {
      const response = await axios.get(`${URL}/productos/buscar?termino=${busqueda}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.ok) {
        setProductos(response.data.productos);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      toast.error('Error al buscar productos');
    }
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    const nuevoTotal = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
    setTotal(nuevoTotal);
  };

  const realizarVenta = async () => {
    try {
      const ventaData = {
        id_cliente: cliente ? cliente.id_cliente : null,
        tipo_venta: 'producto',
        total_venta: total,
        detalles: carrito.map(item => ({
          tipo_item: 'producto',
          id_item: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: item.precio_venta * item.cantidad
        }))
      };

      const response = await axios.post(`${URL}/ventas`, ventaData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ok) {
        toast.success('Venta realizada con éxito');
        // Descargar PDF automáticamente
        window.open(response.data.venta.pdf_url, '_blank');
        // Limpiar el estado
        setCliente(null);
        setCarrito([]);
        setBusqueda('');
        setTotal(0);
      }
    } catch (error) {
      console.error('Error al realizar la venta:', error);
      toast.error('Error al realizar la venta');
    }
  };

  return (
    <div> 
        <div className='nuevent' > </div>
    <div className="nueva-venta-container">
      <h1>Nueva Venta</h1>
      <div className="cliente-busqueda">
        <input
          type="text"
          placeholder="NIT del cliente"
          onChange={(e) => buscarCliente(e.target.value)}
        />
        {cliente && (
          <div className="cliente-info">
            <p>Nombre: {cliente.nombre}</p>
            <p>NIT: {cliente.nit}</p>
          </div>
        )}
      </div>
      <div className="producto-busqueda">
        <input
          type="text"
          placeholder="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={buscarProducto}>Buscar</button>
      </div>
      <div className="resultados-busqueda">
        {productos.map(producto => (
          <div key={producto.id} className="producto-item">
            <span>{producto.nombre}</span>
            <span>${producto.precio_venta}</span>
            <button onClick={() => agregarAlCarrito(producto)}>Agregar</button>
          </div>
        ))}
      </div>
      <div className="carrito">
        <h2>Carrito</h2>
        {carrito.map(item => (
          <div key={item.id} className="carrito-item">
            <span>{item.nombre}</span>
            <span>Cantidad: {item.cantidad}</span>
            <span>${item.precio_venta * item.cantidad}</span>
            <button onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
          </div>
        ))}
      </div>
      <div className="total">
        <h2>Total: ${total}</h2>
      </div>
      <button className="realizar-venta" onClick={realizarVenta}>Realizar Venta</button>
      <ToastContainer />
    </div>
    </div>
  );
};

export default NuevaVenta;