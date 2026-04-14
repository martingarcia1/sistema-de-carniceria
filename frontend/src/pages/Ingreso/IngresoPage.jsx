import { useEffect, useState } from 'react';
import { getProductos, getIngresos, registrarIngreso } from '../../api/mercaderiaApi';
import BalanzaDisplay from '../../components/BalanzaDisplay';
import ProductoSelector from '../../components/ProductoSelector';
import TablaHistorial from '../../components/TablaHistorial';

export default function IngresoPage() {
  const [productos, setProductos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [form, setForm] = useState({ productoId: '', kg: '', precioTotalCompra: '', observacion: '' });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getProductos().then((r) => setProductos(r.data));
    cargarIngresos();
  }, []);

  const cargarIngresos = () =>
    getIngresos().then((r) => setIngresos(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await registrarIngreso({
        productoId: Number(form.productoId),
        kg: Number(form.kg),
        precioTotalCompra: Number(form.precioTotalCompra),
        observacion: form.observacion,
      });
      setForm({ productoId: '', kg: '', precioTotalCompra: '', observacion: '' });
      await cargarIngresos();
      await getProductos().then((r) => setProductos(r.data));
    } finally {
      setCargando(false);
    }
  };

  const columnas = [
    { key: 'fecha', label: 'Fecha', render: (f) => new Date(f.fecha).toLocaleString('es-AR') },
    { key: 'productoNombre', label: 'Producto' },
    { key: 'kg', label: 'Kg', render: (f) => f.kg.toFixed(3) },
    { key: 'precioCostoKg', label: '$/kg', render: (f) => `$ ${f.precioCostoKg.toFixed(2)}` },
    { key: 'precioTotalCompra', label: 'Total', render: (f) => `$ ${f.precioTotalCompra.toFixed(2)}` },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Ingreso de Mercadería</h1>
      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Producto</label>
          <ProductoSelector
            productos={productos}
            value={form.productoId}
            onChange={(id) => setForm((f) => ({ ...f, productoId: id }))}
          />
          <label style={styles.label}>Peso (kg)</label>
          <input style={styles.input} type="number" step="0.001" min="0"
            value={form.kg} onChange={(e) => setForm((f) => ({ ...f, kg: e.target.value }))} required />
          <label style={styles.label}>Precio total de compra ($)</label>
          <input style={styles.input} type="number" step="0.01" min="0"
            value={form.precioTotalCompra} onChange={(e) => setForm((f) => ({ ...f, precioTotalCompra: e.target.value }))} required />
          {form.kg && form.precioTotalCompra && (
            <p style={styles.costoKg}>
              Costo/kg: $ {(Number(form.precioTotalCompra) / Number(form.kg)).toFixed(2)}
            </p>
          )}
          <label style={styles.label}>Observación</label>
          <input style={styles.input} type="text"
            value={form.observacion} onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))} />
          <button type="submit" style={styles.btn} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Registrar Ingreso'}
          </button>
        </form>
        <BalanzaDisplay onPesoAceptado={(p) => setForm((f) => ({ ...f, kg: p }))} />
      </div>
      <h2 style={styles.subtitulo}>Historial de Ingresos</h2>
      <TablaHistorial columnas={columnas} filas={ingresos} sinDatos="No hay ingresos registrados" />
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
  costoKg: { fontSize: 13, color: '#059669', fontWeight: '600', margin: 0 },
};
