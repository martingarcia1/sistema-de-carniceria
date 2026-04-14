import { useEffect, useState } from 'react';
import { getVentas, registrarVenta, imprimirRecibo } from '../../api/ventasApi';
import { getProductos } from '../../api/mercaderiaApi';
import BalanzaDisplay from '../../components/BalanzaDisplay';
import ProductoSelector from '../../components/ProductoSelector';
import TablaHistorial from '../../components/TablaHistorial';

export default function VentasPage() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [form, setForm] = useState({ productoId: '', kg: '', precioVentaKg: '', observacion: '' });
  const [cargando, setCargando] = useState(false);
  const [ultimaVentaId, setUltimaVentaId] = useState(null);

  useEffect(() => {
    getProductos().then((r) => setProductos(r.data));
    cargarVentas();
  }, []);

  const cargarVentas = () => getVentas().then((r) => setVentas(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await registrarVenta({
        productoId: Number(form.productoId),
        kg: Number(form.kg),
        precioVentaKg: Number(form.precioVentaKg),
        observacion: form.observacion,
      });
      setUltimaVentaId(res.data.id);
      setForm({ productoId: '', kg: '', precioVentaKg: '', observacion: '' });
      await cargarVentas();
      await getProductos().then((r) => setProductos(r.data));
    } finally {
      setCargando(false);
    }
  };

  const handleImprimir = async (id) => {
    try {
      await imprimirRecibo(id);
      alert('Recibo enviado a la impresora');
    } catch {
      alert('Error al imprimir');
    }
  };

  const columnas = [
    { key: 'fecha', label: 'Fecha', render: (f) => new Date(f.fecha).toLocaleString('es-AR') },
    { key: 'productoNombre', label: 'Producto' },
    { key: 'kg', label: 'Kg', render: (f) => f.kg.toFixed(3) },
    { key: 'precioVentaKg', label: '$/kg', render: (f) => `$ ${f.precioVentaKg.toFixed(2)}` },
    { key: 'total', label: 'Total', render: (f) => `$ ${f.total.toFixed(2)}` },
    {
      key: 'acciones', label: '',
      render: (f) => (
        <button onClick={() => handleImprimir(f.id)} style={styles.btnImprimir}>Imprimir recibo</button>
      ),
    },
  ];

  const total = form.kg && form.precioVentaKg
    ? (Number(form.kg) * Number(form.precioVentaKg)).toFixed(2)
    : null;

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Ventas</h1>
      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Producto</label>
          <ProductoSelector productos={productos} value={form.productoId}
            onChange={(id) => setForm((f) => ({ ...f, productoId: id }))} />
          <label style={styles.label}>Peso (kg)</label>
          <input style={styles.input} type="number" step="0.001" min="0"
            value={form.kg} onChange={(e) => setForm((f) => ({ ...f, kg: e.target.value }))} required />
          <label style={styles.label}>Precio de venta ($/kg)</label>
          <input style={styles.input} type="number" step="0.01" min="0"
            value={form.precioVentaKg} onChange={(e) => setForm((f) => ({ ...f, precioVentaKg: e.target.value }))} required />
          {total && <p style={styles.totalDisplay}>Total: $ {total}</p>}
          <label style={styles.label}>Observación</label>
          <input style={styles.input} type="text"
            value={form.observacion} onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))} />
          <button type="submit" style={styles.btn} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar Venta'}
          </button>
          {ultimaVentaId && (
            <button type="button" style={styles.btnSecundario} onClick={() => handleImprimir(ultimaVentaId)}>
              Imprimir última venta
            </button>
          )}
        </form>
        <BalanzaDisplay onPesoAceptado={(p) => setForm((f) => ({ ...f, kg: p }))} />
      </div>
      <h2 style={styles.subtitulo}>Historial de Ventas</h2>
      <TablaHistorial columnas={columnas} filas={ventas} sinDatos="No hay ventas registradas" />
    </div>
  );
}

const styles = {
  container: { padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e3a5f' },
  subtitulo: { fontSize: 18, fontWeight: '600', margin: '32px 0 12px', color: '#374151' },
  layout: { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' },
  form: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320, flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  btn: { marginTop: 8, padding: '10px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 },
  btnSecundario: { padding: '8px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  btnImprimir: { padding: '4px 10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  totalDisplay: { fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', margin: 0 },
};
