import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from '../styles/reportesIngresos.module.css';

const URL = import.meta.env.VITE_URL;

export default function ReportesIngresos() {
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [reportes, setReportes] = useState({
    ingresosPorMes: [],
    ingresosPorCategoria: [],
    ingresosPorTipoItem: []
  });

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]);

  const cargarReportes = async () => {
    try {
      const response = await axios.get(`${URL}/reportes/ingresos`, {
        params: {
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString()
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReportes(response.data.reportes || {
        ingresosPorMes: [],
        ingresosPorCategoria: [],
        ingresosPorTipoItem: []
      });
    } catch (error) {
      console.error('Error al cargar los reportes de ingresos:', error);
      setReportes({
        ingresosPorMes: [],
        ingresosPorCategoria: [],
        ingresosPorTipoItem: []
      });
    }
  };

  return (
    <div className={styles.reportesContainer}>
      <div className={styles.repin}></div>
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          <span className={styles.titleIcon}>📊</span>
          Dashboard de Ingresos
        </h1>
        
        <div className={styles.filterControls}>
          <div className={styles.dateGroup}>
            <div className={styles.datePickerWrapper}>
              <span className={styles.dateLabel}>Desde</span>
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
              <span className={styles.dateLabel}>Hasta</span>
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
          </div>
          <button onClick={cargarReportes} className={styles.updateButton}>
            <span className={styles.buttonIcon}>🔄</span>
            Actualizar Datos
          </button>
        </div>
      </div>
  
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>📈</span>
            Tendencia de Ingresos Mensuales
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportes.ingresosPorMes}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="mes" 
                stroke="#374151"
                tick={{ fill: '#374151' }}
              />
              <YAxis 
                stroke="#374151"
                tick={{ fill: '#374151' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_ingresos" 
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#colorIngresos)"
                name="Total Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>📊</span>
            Ingresos por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportes.ingresosPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="nombre_categoria" 
                stroke="#374151"
                tick={{ fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                stroke="#374151"
                tick={{ fill: '#374151' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="total_ingresos" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Total Ingresos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
  
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            <span className={styles.chartIcon}>🍩</span>
            Distribución por Tipo de Item
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportes.ingresosPorTipoItem}
                dataKey="total_ingresos"
                nameKey="tipo_item"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {reportes.ingresosPorTipoItem.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}