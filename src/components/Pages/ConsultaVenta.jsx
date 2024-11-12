import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../styles/ConsultaVenta.module.css';

function ConsultaVenta() {
    const [ventas, setVentas] = useState([]);
    const [filtradas, setFiltradas] = useState([]);
    const [comprobante, setComprobante] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerVentas = async (params = {}) => {
        try {
            const response = await axios.get(`${URL}consultas/ventas/consulta`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setVentas(response.data.ventas);
            setFiltradas(response.data.ventas);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron obtener las ventas',
                icon: 'error'
            });
        }
    };

    useEffect(() => {
        obtenerVentas();
    }, []);

    const buscarPorComprobante = (e) => {
        const valor = e.target.value;
        setComprobante(valor);
        if (!valor) {
            setFiltradas(ventas);
            return;
        }
        setFiltradas(ventas.filter(venta => 
            venta.num_comprobante.toLowerCase().includes(valor.toLowerCase())
        ));
    };

    const buscarPorFechas = async () => {
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor seleccione ambas fechas',
                icon: 'warning'
            });
            return;
        }

        try {
            await obtenerVentas({
                fechaInicio,
                fechaFin
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al buscar por fechas',
                icon: 'error'
            });
        }
    };

    const limpiarFiltros = () => {
        setComprobante('');
        setFechaInicio('');
        setFechaFin('');
        obtenerVentas();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Consulta de Ventas</h1>
                <div className={styles.filtros}>
                    <input
                        type="text"
                        placeholder="Buscar por comprobante"
                        value={comprobante}
                        onChange={buscarPorComprobante}
                        className={styles.inputBusqueda}
                    />
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className={styles.inputFecha}
                    />
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className={styles.inputFecha}
                    />
                    <button 
                        onClick={buscarPorFechas}
                        className={styles.btnBuscar}
                    >
                        Buscar
                    </button>
                    <button 
                        onClick={limpiarFiltros}
                        className={styles.btnLimpiar}
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            <div className={styles.tablaContainer}>
                <table className={styles.tabla}>
                    <thead>
                        <tr>
                            <th>Comprobante</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Vendedor</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtradas.map((venta) => (
                            <tr key={venta.id_venta}>
                                <td>{venta.num_comprobante}</td>
                                <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                                <td>{venta.nombre_cliente}</td>
                                <td>{venta.nombre_vendedor}</td>
                                <td>Q{venta.total.toFixed(2)}</td>
                                <td className={styles[venta.estado ? 'activo' : 'inactivo']}>
                                    {venta.estado ? 'Activa' : 'Anulada'}
                                </td>
                                <td>
                                    <button 
                                        className={styles.btnDetalles}
                                        onClick={() => verDetalles(venta.id_venta)}
                                    >
                                        Ver Detalles
                                    </button>
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