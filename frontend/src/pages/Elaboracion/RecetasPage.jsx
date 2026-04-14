import { useEffect, useState } from 'react';
import { getRecetas, guardarReceta } from '../../api/elaboracionApi';
import { getProductos } from '../../api/mercaderiaApi';

export default function RecetasPage() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ productoId: '', descripcion: '', ingredientes: [{ insumoId: '', proporcion: '' }] });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getRecetas().then((r) => setRecetas(r.data));
    getProductos().then((r) => setProductos(r.data));
  }, []);

  const agregarIngrediente = () =>
    setForm((f) => ({ ...f, ingredientes: [...f.ingredientes, { insumoId: '', proporcion: '' }] }));

  const actualizarIngrediente = (i, campo, valor) =>
    setForm((f) => ({ ...f, ingredientes: f.ingredientes.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await guardarReceta({
        productoId: Number(form.productoId),
        descripcion: form.descripcion,
        ingredientes: form.ingredientes.map((ing) => ({
          insumoId: Number(ing.insumoId),
          proporcion: Number(ing.proporcion),
        })),
      });
      getRecetas().then((r) => setRecetas(r.data));
      setForm({ productoId: '', descripcion: '', ingredientes: [{ insumoId: '', proporcion: '' }] });
    } finally {
      setCargando(false);
    }
  };

  const insumos = productos.filter((p) => p.tipo === 1);
  const elaborados = productos.filter((p) => p.tipo === 2);

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Recetas</h1>
      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Producto elaborado</label>
          <select value={form.productoId} onChange={(e) => setForm((f) => ({ ...f, productoId: e.target.value }))} style={styles.input} required>
            <option value="">Seleccionar</option>
            {elaborados.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <label style={styles.label}>Descripción</label>
          <input style={styles.input} type="text" value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          <label style={styles.label}>Ingredientes (% sobre kg producidos)</label>
          {form.ingredientes.map((ing, i) => (
            <div key={i} style={styles.row}>
              <select value={ing.insumoId} onChange={(e) => actualizarIngrediente(i, 'insumoId', e.target.value)} style={styles.selectInsumo}>
                <option value="">Insumo</option>
                {insumos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <input style={styles.inputProp} type="number" step="0.01" min="0" max="100" placeholder="%"
                value={ing.proporcion} onChange={(e) => actualizarIngrediente(i, 'proporcion', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={agregarIngrediente} style={styles.btnAgregar}>+ Ingrediente</button>
          <button type="submit" style={styles.btn} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Receta'}
          </button>
        </form>

        <div style={styles.listaRecetas}>
          <h2 style={styles.subtitulo}>Recetas guardadas</h2>
          {recetas.map((r) => (
            <div key={r.id} style={styles.tarjeta}>
              <strong>{r.productoNombre}</strong>
              <p style={{ margin: '4px 0', color: '#6b7280', fontSize: 13 }}>{r.descripcion}</p>
              {r.ingredientes.map((ing, i) => (
                <p key={i} style={styles.ingrediente}>{ing.insumoNombre}: {ing.proporcion}%</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e3a5f' },
  subtitulo: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#374151' },
  layout: { display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' },
  form: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320, flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  btn: { marginTop: 8, padding: '10px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 },
  btnAgregar: { padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  row: { display: 'flex', gap: 8 },
  selectInsumo: { flex: 2, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  inputProp: { flex: 1, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  listaRecetas: { flex: 1, minWidth: 280 },
  tarjeta: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, background: '#f9fafb' },
  ingrediente: { margin: '2px 0', fontSize: 13, color: '#374151' },
};
