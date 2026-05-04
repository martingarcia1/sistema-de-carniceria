import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [rango, setRango] = useState('hoy');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [rango]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/summary?rango=${rango}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error('Error al obtener datos del dashboard');
      }
    } catch {
      toast.error('Error de red al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div style={{ color: 'white', padding: '20px' }}>Cargando Panel de Control...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Panel de Control (Dashboard)</h1>
          <p>Métricas financieras, costos de mercadería y rentabilidad</p>
        </div>
        <div className="rango-selector">
          <button className={rango === 'hoy' ? 'active' : ''} onClick={() => setRango('hoy')}>Hoy</button>
          <button className={rango === 'semana' ? 'active' : ''} onClick={() => setRango('semana')}>Última Semana</button>
          <button className={rango === 'mes' ? 'active' : ''} onClick={() => setRango('mes')}>Este Mes</button>
          <button className={rango === 'ano' ? 'active' : ''} onClick={() => setRango('ano')}>Este Año</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <h3>Ingresos Brutos (Ventas)</h3>
          <div className="value" style={{ color: '#60a5fa' }}>${data.ingresosTotales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          <p className="subtitle">Total de dinero que ingresó a la caja</p>
        </div>

        <div className="kpi-card" style={{ borderTop: '4px solid #ef4444' }}>
          <h3>Costo de Mercadería</h3>
          <div className="value" style={{ color: '#f87171' }}>${data.costoMercaderiaVendida.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          <p className="subtitle">Lo que costó la mercadería vendida</p>
        </div>

        <div className="kpi-card" style={{ borderTop: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h3>Ganancia Neta (Rentabilidad)</h3>
          <div className="value" style={{ color: '#10b981' }}>${data.gananciaNeta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          <p className="subtitle">Beneficio real después de pagar mercadería</p>
        </div>

        <div className="kpi-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <h3>Margen Promedio</h3>
          <div className="value" style={{ color: '#a78bfa' }}>{data.margenGananciaPromedio.toFixed(1)}%</div>
          <p className="subtitle">Porcentaje de ganancia sobre las ventas</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h2>Top 5 Productos Más Vendidos</h2>
          {data.topProductos.length === 0 ? (
            <p style={{ color: '#a0a0a0', fontStyle: 'italic' }}>No hay ventas registradas en este periodo.</p>
          ) : (
            <div className="top-products-list">
              {data.topProductos.map((p, index) => {
                // Calcular el % de la barra relativo al más vendido
                const maxKg = data.topProductos[0].totalKgVendidos;
                const width = maxKg > 0 ? (p.totalKgVendidos / maxKg) * 100 : 0;
                
                return (
                  <div key={p.productoId} className="top-product-item">
                    <div className="tp-header">
                      <span className="tp-name">{index + 1}. {p.nombre}</span>
                      <span className="tp-stats">{p.totalKgVendidos.toFixed(2)} kg | ${p.totalIngresosGenerados.toFixed(2)}</span>
                    </div>
                    <div className="tp-bar-bg">
                      <div className="tp-bar-fill" style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
