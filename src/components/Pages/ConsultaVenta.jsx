import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../styles/ConsultaVenta.module.css';

function ConsultaVenta() {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [comprobante, setComprobante] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerVentas = async () => {
        try {
            const response = await axios.get(`${URL}/consultas/ventas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    fechaInicio,
                    fechaFin,
                    comprobante
                }
            });
            setVentas(response.data.ventas);
            setVentasFiltradas(response.data.ventas);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.msg || 'Error al obtener las ventas',
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
        
        obtenerVentas();
    }, []);

    const buscarVentas = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setComprobante(searchTerm);
        setVentasFiltradas(
            ventas.filter((venta) =>
                venta.numero_comprobante.toLowerCase().includes(searchTerm)
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
        await obtenerVentas();
    };

    return (
        <div className={styles.priconst}>
            <div className={styles.priconst}></div>
                <div className={styles.header}>
                    <h1>Consulta de Ventas</h1>
                <div className={styles.filtros}>
                    <input
                        type="text"
                        placeholder="Buscar por comprobante"
                        value={comprobante}
                        onChange={buscarVentas}
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
                            <th>Comprobante</th>
                            <th>Fecha Venta</th>
                            <th>Cliente</th>
                            <th>Usuario</th>
                            <th>Caja</th>
                            <th>Total</th>
                            <th>Recibido</th>
                            <th>Cambio</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventasFiltradas.map((venta) => (
                            <tr key={venta.id_venta}>
                                <td>{venta.numero_comprobante}</td>
                                <td>{new Date(venta.fecha_venta).toLocaleString()}</td>
                                <td>{venta.nombre_cliente || 'No especificado'}</td>
                                <td>{venta.nombre_usuario || 'No especificado'}</td>
                                <td>Caja #{venta.id_caja || 'N/A'}</td>
                                <td>Q{Number(venta.total_venta).toFixed(2)}</td>
                                <td>Q{Number(venta.monto_recibido).toFixed(2)}</td>
                                <td>Q{Number(venta.cambio).toFixed(2)}</td>
                                <td className={styles[venta.estado_venta ? 'activo' : 'inactivo']}>
                                    {venta.estado_venta ? 'Activa' : 'Anulada'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ConsultaVenta;