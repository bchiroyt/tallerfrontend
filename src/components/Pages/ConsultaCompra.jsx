import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../styles/ConsultaCompra.module.css';

function ConsultaCompra() {
    const [compras, setCompras] = useState([]);
    const [comprasFiltradas, setComprasFiltradas] = useState([]);
    const [comprobante, setComprobante] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [mostrarDetalles, setMostrarDetalles] = useState(false);

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerCompras = async () => {
        try {
            const response = await axios.get(`${URL}/consultas/compras`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    fechaInicio,
                    fechaFin,
                    comprobante
                }
            });
            setCompras(response.data.compras);
            setComprasFiltradas(response.data.compras);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || 'Error al obtener las compras',
                icon: 'error'
            });
        }
    };

    useEffect(() => {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        setFechaInicio(hace30Dias.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
        
        obtenerCompras();
    }, []);

    const buscarCompras = (e) => {
        const searchTerm = e.target.value;
        setComprobante(searchTerm);
        setComprasFiltradas(
            compras.filter((compra) =>
                compra.numero_comprobante.toString().includes(searchTerm)
            )
        );
    };

    const filtrarPorFechas = async () => {
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                title: 'Error',
                text: 'Debe seleccionar ambas fechas',
                icon: 'warning'
            });
            return;
        }
        await obtenerCompras();
    };

    return (
        <div> 
        <div className={styles.prives}></div>
            <div className={styles.container}>
                <div className={styles.header}>
                <h1>Consulta de Compras</h1>
                <div className={styles.filtros}>
                    <input
                        type="text"
                        placeholder="Buscar por número de comprobante"
                        value={comprobante}
                        onChange={buscarCompras}
                        className={styles.searchInput}
                    />
                    <div className={styles.fechas}>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className={styles.dateInput}
                        />
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className={styles.dateInput}
                        />
                        <button 
                            onClick={filtrarPorFechas}
                            className={styles.filterButton}
                        >
                            Filtrar
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Serie-Comprobante</th>
                            <th>Tipo</th>
                            <th>Fecha Compra</th>
                            <th>Fecha Facturación</th>
                            <th>Proveedor</th>
                            <th>Usuario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                    {comprasFiltradas.map((compra) => (
                        <tr key={compra.id_compra}>
                            <td>{`${compra.serie}-${compra.numero_comprobante}`}</td>
                            <td>{compra.tipo_comprobante}</td>
                            <td>{new Date(compra.fecha_compra).toLocaleString()}</td>
                            <td>{new Date(compra.fecha_facturacion).toLocaleDateString()}</td>
                            <td>{compra.nombre_proveedor}</td>
                            <td>{compra.nombre_usuario}</td>
                            <td>Q{Number(compra.total_compra).toFixed(2)}</td>
                            
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarDetalles && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Detalles de la Compra</h2>
                        <table className={styles.tableDetalles}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detallesCompra.map((detalle, index) => (
                                    <tr key={index}>
                                        <td>{detalle.nombre_producto}</td>
                                        <td>{detalle.cantidad}</td>
                                        <td>Q{detalle.precio_unitario.toFixed(2)}</td>
                                        <td>Q{detalle.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button 
                            className={styles.btnCerrar}
                            onClick={() => setMostrarDetalles(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

export default ConsultaCompra;