import { useEffect, useState } from 'react';
import { getMetricas } from '../../api/metricasApi';

export default function MetricasPage() {
  const [data, setData] = useState(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const cargar = () => {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    getMetricas(params).then((r) => setData(r.data));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Métricas del Negocio</h1>
      <div style={styles.filtros}>
        <label style={styles.label}>Desde</label>
        <input style={styles.input} type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <label style={styles.label}>Hasta</label>
        <input style={styles.input} type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button style={styles.btn} onClick={cargar}>Actualizar</button>
      </div>

      {data && (
        <>
          <div style={styles.cards}>
            <Tarjeta titulo="Stock Total" valor={`${data.stockTotalKg.toFixed(2)} kg`} color="#2563eb" />
            <Tarjeta titulo="Ventas del período" valor={`$ ${data.ventasTotalesPeriodo.toFixed(2)}`} color="#059669" />
            <Tarjeta titulo="Ganancia Neta" valor={`$ ${data.gananciaNeta.toFixed(2)}`} color={data.gananciaNeta >= 0 ? '#16a34a' : '#dc2626'} />
          </div>

          <h2 style={styles.subtitulo}>Ganancia por Producto</h2>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {['Producto', 'Precio Venta Prom.', 'Costo Prom.', 'Ganancia/kg', 'Kg Vendidos'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.gananciaPorProducto.map((g, i) => (
                <tr key={i} style={i % 2 ? { background: '#f3f4f6' } : {}}>
                  <td style={styles.td}>{g.nombre}</td>
                  <td style={styles.td}>$ {g.precioPromedioVenta.toFixed(2)}</td>
                  <td style={styles.td}>$ {g.precioPromedioCosto.toFixed(2)}</td>
                  <td style={{ ...styles.td, color: g.gananciaKg >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    $ {g.gananciaKg.toFixed(2)}
                  </td>
                  <td style={styles.td}>{g.totalVendidoKg.toFixed(3)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={styles.subtitulo}>Stock por Producto</h2>
          <div style={styles.stockGrid}>
            {data.stockPorProducto.map((s) => (
              <div key={s.productoId} style={styles.stockCard}>
                <p style={styles.stockNombre}>{s.nombre}</p>
                <p style={styles.stockKg}>{s.stockKg.toFixed(3)} kg</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Tarjeta({ titulo, valor, color }) {
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 10, padding: 20, textAlign: 'center', minWidth: 180 }}>
      <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{titulo}</p>
      <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 'bold', color }}>{valor}</p>
    </div>
  );
}

const styles = {
  container: { padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e3a5f' },
  subtitulo: { fontSize: 18, fontWeight: '600', margin: '32px 0 12px', color: '#374151' },
  filtros: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  btn: { padding: '8px 18px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  cards: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '10px 12px', background: '#1e3a5f', color: '#fff', textAlign: 'left' },
  td: { padding: '8px 12px', borderBottom: '1px solid #e5e7eb' },
  stockGrid: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  stockCard: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, minWidth: 140, textAlign: 'center', background: '#f9fafb' },
  stockNombre: { margin: 0, fontSize: 13, color: '#6b7280' },
  stockKg: { margin: '6px 0 0', fontSize: 22, fontWeight: 'bold', color: '#1e3a5f' },
};
