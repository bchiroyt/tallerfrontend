import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import '../styles/nuevacompra.css';

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
      
      let resultados;
      if (response.data.ok) {
        resultados = response.data[productoActual.tipo_producto] ? [response.data[productoActual.tipo_producto]] : [];
      } else {
        resultados = [];
      }
      
      console.log('Resultados de búsqueda:', resultados);
      setResultadosBusqueda(resultados);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setResultadosBusqueda([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      buscarProducto();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, productoActual.tipo_producto]);

  const seleccionarProducto = (producto) => {
    console.log('Producto seleccionado:', producto);
    
    // Verificar si existe id o id_producto
    const productoId = producto.id_producto || producto.id;
    
    if (!producto || !productoId) {
      console.error('Producto inválido:', producto);
      return;
    }
  
    setProductoActual({
      ...productoActual,
      id_producto: productoId,
      precio_unitario: Number(producto.precio_costo) || 0,
      precio_venta: Number(producto.precio_venta) || 0,
      nombre: producto.nombre || '',
      codigo: producto.codigo || producto.codigo_barra || '',
      seleccionado: true
    });
    setBusqueda(producto.nombre || '');
    setResultadosBusqueda([]);
  };
  

  const agregarDetalle = () => {
    if (!productoActual.seleccionado) {
      alert('Por favor, seleccione un producto');
      return;
    }
  
    const subtotal = productoActual.cantidad * productoActual.precio_unitario;
  
    const nuevoDetalle = {
      tipo_producto: productoActual.tipo_producto,
      id_producto: productoActual.id_producto,
      nombre: productoActual.nombre,
      cantidad: productoActual.cantidad,
      precio_unitario: productoActual.precio_unitario,
      precio_venta: productoActual.precio_venta,
      subtotal
    };
  
    setCompra({
      ...compra,
      detalles: [...compra.detalles, nuevoDetalle]
    });
  
    // Resetear el producto actual
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
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = compra.detalles.filter((_, i) => i !== index);
    setCompra({ ...compra, detalles: nuevosDetalles });
  };

  const calcularTotal = () => {
    return compra.detalles.reduce((total, detalle) => total + detalle.subtotal, 0);
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text('Detalle de Compra', 20, 20);
    doc.text(`Proveedor: ${proveedores.find(p => p.id_proveedor === compra.id_proveedor)?.nombre_compañia}`, 20, 30);
    doc.text(`Fecha: ${compra.fecha_facturacion}`, 20, 40);
    doc.text(`Tipo de Comprobante: ${compra.tipo_comprobante}`, 20, 50);
    doc.text(`Serie: ${compra.serie}`, 20, 60);

    let y = 80;
    compra.detalles.forEach((detalle, index) => {
      doc.text(`${index + 1}. ${detalle.nombre} - Cantidad: ${detalle.cantidad} - Precio: Q${detalle.precio_unitario} - Subtotal: Q${detalle.subtotal}`, 20, y);
      y += 10;
    });

    doc.text(`Total: Q${calcularTotal().toFixed(2)}`, 20, y + 10);
    doc.save('detalle_compra.pdf');
  };

  const guardarCompra = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${URL}/compras`, compra, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.ok) {
        alert('Compra guardada exitosamente');
        // Redirigir al detalle de la compra recién creada
        navigate(`/DetalleCompra/${response.data.compra.id_compra}`);
      }
    } catch (error) {
      console.error('Error al guardar la compra:', error);
      alert(error.response?.data?.msg || 'Error al guardar la compra');
    }
  };

  const cancelarCompra = () => {
    if (window.confirm('¿Está seguro de cancelar la compra? Se perderán todos los datos.')) {
      navigate('/ListaCompra');
    }
  };

  return (
    <div>
      <div className='necom'></div> 
    <div className="compras-container">
      <h1 className="compras-title">Nueva Compra</h1>
      <form className="compras-form">
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="id_proveedor">Proveedor</label>
          <select
            className="compras-select"
            id="id_proveedor"
            name="id_proveedor"
            value={compra.id_proveedor}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map(proveedor => (
              <option 
                key={`prov-${proveedor.id_proveedor}`} 
                value={proveedor.id_proveedor}
              >
                {proveedor.nombre_compañia}
              </option>
            ))}
          </select>
        </div>
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="tipo_comprobante">Tipo de Comprobante</label>
          <select
            className="compras-select"
            id="tipo_comprobante"
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
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="serie">Serie</label>
          <input
            className="compras-input"
            id="serie"
            type="text"
            name="serie"
            value={compra.serie}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="fecha_facturacion">Fecha de Facturación</label>
          <input
            className="compras-input"
            id="fecha_facturacion"
            type="date"
            name="fecha_facturacion"
            value={compra.fecha_facturacion}
            onChange={handleInputChange}
            required
          />
        </div>

        <h2 className="compras-subtitle">Agregar Producto</h2>
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="tipo_producto">Tipo de Producto</label>
          <select
            className="compras-select"
            id="tipo_producto"
            name="tipo_producto"
            value={productoActual.tipo_producto}
            onChange={handleProductoChange}
          >
            <option value="accesorio">Accesorio</option>
            <option value="bicicleta">Bicicleta</option>
            <option value="producto">Producto</option>
          </select>
        </div>
        <div className="compras-form-group">
          <input
            className="compras-input"
            type="text"
            placeholder="Buscar producto por nombre o código"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {resultadosBusqueda.length > 0 && (
          <ul className="compras-search-results">
            {resultadosBusqueda.map((producto, index) => (
              <li 
                key={`search-${producto.id_producto || producto.id || index}`}
                className="compras-search-item"
                onClick={() => seleccionarProducto(producto)}
                style={{ cursor: 'pointer' }}
              >
                <div className="compras-search-item-name">{producto.nombre}</div>
                <div className="compras-search-item-details">
                  Código: {producto.codigo || producto.codigo_barra || 'N/A'} - 
                  Precio: Q{Number(producto.precio_venta || 0).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="cantidad">Cantidad</label>
          <input
            className="compras-input"
            id="cantidad"
            type="number"
            name="cantidad"
            value={productoActual.cantidad}
            onChange={handleProductoChange}
            min="1"
          />
        </div>
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="precio_unitario">Precio de Costo</label>
          <input
            className="compras-input"
            id="precio_unitario"
            type="number"
            name="precio_unitario"
            value={productoActual.precio_unitario}
            onChange={handleProductoChange}
            min="0"
            step="0.01"
          />
        </div>
        <div className="compras-form-group">
          <label className="compras-label" htmlFor="precio_venta">Precio de Venta</label>
          <input
            className="compras-input"
            id="precio_venta"
            type="number"
            name="precio_venta"
            value={productoActual.precio_venta}
            onChange={handleProductoChange}
            min="0"
            step="0.01"
          />
        </div>
        <button
          className="compras-button"
          type="button"
          onClick={agregarDetalle}
        >
          Agregar a la compra
        </button>

        <h2 className="compras-subtitle">Detalles de la Compra</h2>
        <table className="compras-table">
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
                    className="compras-button compras-button-delete"
                    type="button"
                    onClick={() => eliminarDetalle(index)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5" className="compras-total-label">Total:</td>
              <td className="compras-total-amount">Q{calcularTotal().toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div className="compras-form-actions">
      <button
        className="compras-button compras-button-cancel"
        type="button"
        onClick={cancelarCompra}
      >
        Cancelar Compra
      </button>
      <button
        className="compras-button compras-button-save"
        type="button"
        onClick={guardarCompra}
      >
        Guardar Compra
      </button>
    </div>
      </form>
    </div>
    </div>
  );
}