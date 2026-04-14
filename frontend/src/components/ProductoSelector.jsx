export default function ProductoSelector({ productos = [], value, onChange, placeholder = 'Seleccionar producto' }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} style={styles.select}>
      <option value="" disabled>{placeholder}</option>
      {productos.map((p) => (
        <option key={p.id} value={p.id}>{p.nombre} — Stock: {p.stockKg.toFixed(3)} kg</option>
      ))}
    </select>
  );
}

const styles = {
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', width: '100%', fontSize: 14 },
};
