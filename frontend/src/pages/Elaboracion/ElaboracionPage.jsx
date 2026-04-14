import { useEffect, useState } from 'react';
import { getElaboraciones, registrarElaboracion } from '../../api/elaboracionApi';
import { getProductos } from '../../api/mercaderiaApi';
import BalanzaDisplay from '../../components/BalanzaDisplay';
import ProductoSelector from '../../components/ProductoSelector';
import TablaHistorial from '../../components/TablaHistorial';

export default function ElaboracionPage() {
  const [productos, setProductos] = useState([]);
  const [elaboraciones, setElaboraciones] = useState([]);
  const [form, setForm] = useState({ productoFinalId: '', kgProducidos: '', observacion: '' });
  const [insumos, setInsumos] = useState([{ insumoId: '', kgConsumidos: '' }]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getProductos().then((r) => setProductos(r.data));
    getElaboraciones().then((r) => setElaboraciones(r.data));
  }, []);

  const agregarInsumo = () => setInsumos((prev) => [...prev, { insumoId: '', kgConsumidos: '' }]);

  const actualizarInsumo = (i, campo, valor) =>
    setInsumos((prev) => prev.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await registrarElaboracion({
        productoFinalId: Number(form.productoFinalId),
        kgProducidos: Number(form.kgProducidos),
        observacion: form.observacion,
        detalles: insumos.map((ins) => ({
          insumoId: Number(ins.insumoId),
          kgConsumidos: Number(ins.kgConsumidos),
        })),
      });
      setForm({ productoFinalId: '', kgProducidos: '', observacion: '' });
      setInsumos([{ insumoId: '', kgConsumidos: '' }]);
      getElaboraciones().then((r) => setElaboraciones(r.data));
      getProductos().then((r) => setProductos(r.data));
    } finally {
      setCargando(false);
    }
  };

  const columnas = [
    { key: 'fecha', label: 'Fecha', render: (f) => new Date(f.fecha).toLocaleString('es-AR') },
    { key: 'productoFinalNombre', label: 'Producto Final' },
    { key: 'kgProducidos', label: 'Kg Producidos', render: (f) => f.kgProducidos.toFixed(3) },
    { key: 'observacion', label: 'Observación' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Elaboración de Productos</h1>
      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Producto Final</label>
          <ProductoSelector productos={productos} value={form.productoFinalId}
            onChange={(id) => setForm((f) => ({ ...f, productoFinalId: id }))} />
          <label style={styles.label}>Kg Producidos</label>
          <input style={styles.input} type="number" step="0.001" min="0"
            value={form.kgProducidos} onChange={(e) => setForm((f) => ({ ...f, kgProducidos: e.target.value }))} required />
          <label style={styles.label}>Insumos utilizados</label>
          {insumos.map((ins, i) => (
            <div key={i} style={styles.insumoRow}>
              <select value={ins.insumoId} onChange={(e) => actualizarInsumo(i, 'insumoId', e.target.value)} style={styles.selectInsumo}>
                <option value="">Insumo</option>
                {productos.filter((p) => p.tipo === 1).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <input style={styles.inputKg} type="number" step="0.001" min="0" placeholder="kg"
                value={ins.kgConsumidos} onChange={(e) => actualizarInsumo(i, 'kgConsumidos', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={agregarInsumo} style={styles.btnAgregar}>+ Agregar insumo</button>
          <label style={styles.label}>Observación</label>
          <input style={styles.input} type="text"
            value={form.observacion} onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))} />
          <button type="submit" style={styles.btn} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Registrar Elaboración'}
          </button>
        </form>
        <BalanzaDisplay onPesoAceptado={(p) => setForm((f) => ({ ...f, kgProducidos: p }))} />
      </div>
      <h2 style={styles.subtitulo}>Historial de Elaboraciones</h2>
      <TablaHistorial columnas={columnas} filas={elaboraciones} sinDatos="No hay elaboraciones registradas" />
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
  btnAgregar: { padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  insumoRow: { display: 'flex', gap: 8 },
  selectInsumo: { flex: 2, padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  inputKg: { flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
};
