import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from '../styles/reportesVentas.module.css';
import PropTypes from 'prop-types';

const URL = import.meta.env.VITE_URL;

const Button = ({ onClick, children }) => (
  <button className="custom-button" onClick={onClick}>{children}</button>
);

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default function ReportesVentas() {
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [reportes, setReportes] = useState({
    ventasPorMes: [],
    productosMasVendidos: [],
    ventasPorCliente: []
  });

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]);

  const cargarReportes = async () => {
    try {
      const response = await axios.get(`${URL}/reportes/ventas`, {
        params: {
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString()
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReportes(response.data.reportes || {
        ventasPorMes: [],
        productosMasVendidos: [],
        ventasPorCliente: []
      });
    } catch (error) {
      console.error('Error al cargar los reportes de ventas:', error);
      setReportes({
        ventasPorMes: [],
        productosMasVendidos: [],
        ventasPorCliente: []
      });
    }
  };

  return (
    <div className={styles.reportesContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>Análisis de Ventas</h1>
        <div className={styles.filterSection}>
          <div className={styles.datePickerWrapper}>
            <span className={styles.dateLabel}>Desde:</span>
            <DatePicker
              selected={fechaInicio}
              onChange={(date) => setFechaInicio(date)}
              selectsStart
              startDate={fechaInicio}
              endDate={fechaFin}
              className={styles.datePicker}
            />
          </div>
          <div className={styles.datePickerWrapper}>
            <span className={styles.dateLabel}>Hasta:</span>
            <DatePicker
              selected={fechaFin}
              onChange={(date) => setFechaFin(date)}
              selectsEnd
              startDate={fechaInicio}
              endDate={fechaFin}
              minDate={fechaInicio}
              className={styles.datePicker}
            />
          </div>
          <Button onClick={cargarReportes}>Actualizar Datos</Button>
        </div>
      </div>
  
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>📈</span>
            Tendencia de Ventas Mensuales
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportes.ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="mes" stroke="#333" tick={{ fill: '#333' }} />
              <YAxis stroke="#333" tick={{ fill: '#333' }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_ventas" 
                name="Total Ventas"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>🏆</span>
            Top Productos Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportes.productosMasVendidos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="nombre_producto"
                stroke="#333"
                tick={{ fill: '#333' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="#333" tick={{ fill: '#333' }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="cantidad_vendida" 
                name="Unidades Vendidas"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
  
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>👥</span>
            Ventas por Cliente
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportes.ventasPorCliente}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="nombre_cliente"
                stroke="#333"
                tick={{ fill: '#333' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="#333" tick={{ fill: '#333' }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="total_ventas" 
                name="Total Ventas"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="total_ingresos" 
                name="Total Ingresos"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}