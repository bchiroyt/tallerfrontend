import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../styles/ConsultaCompra.module.css';

function ConsultaCompra() {
    const [compras, setCompras] = useState([]);
    const [filtradas, setFiltradas] = useState([]);
    const [comprobante, setComprobante] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const token = localStorage.getItem("token");
    const URL = import.meta.env.VITE_URL;

    const obtenerCompras = async (params = {}) => {
        try {
            const response = await axios.get(`${URL}consultas/compras/consulta`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setCompras(response.data.compras);
            setFiltradas(response.data.compras);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron obtener las compras',
                icon: 'error'
            });
        }
    };

    useEffect(() => {
        obtenerCompras();
    }, []);

    const buscarPorComprobante = (e) => {
        const valor = e.target.value;
        setComprobante(valor);
        if (!valor) {
            setFiltradas(compras);
            return;
        }
        setFiltradas(compras.filter(compra => 
            compra.num_comprobante.toLowerCase().includes(valor.toLowerCase())
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
            await obtenerCompras({
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
        obtenerCompras();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Consulta de Compras</h1>
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
                            <th>Proveedor</th>
                            <th>Usuario</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtradas.map((compra) => (
                            <tr key={compra.id_compra}>
                                <td>{compra.num_comprobante}</td>
                                <td>{new Date(compra.fecha).toLocaleDateString()}</td>
                                <td>{compra.nombre_proveedor}</td>
                                <td>{compra.nombre_usuario}</td>
                                <td>Q{compra.total.toFixed(2)}</td>
                                <td className={styles[compra.estado ? 'activo' : 'inactivo']}>
                                    {compra.estado ? 'Activa' : 'Anulada'}
                                </td>
                                <td>
                                    <button 
                                        className={styles.btnDetalles}
                                        onClick={() => verDetalles(compra.id_compra)}
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

export default ConsultaCompra;