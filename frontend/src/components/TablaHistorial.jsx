export default function TablaHistorial({ columnas = [], filas = [], sinDatos = 'Sin registros' }) {
  if (!filas.length) return <p style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>{sinDatos}</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.key} style={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} style={i % 2 === 0 ? {} : { background: '#f3f4f6' }}>
              {columnas.map((col) => (
                <td key={col.key} style={styles.td}>
                  {col.render ? col.render(fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '10px 12px', background: '#1e3a5f', color: '#fff', textAlign: 'left' },
  td: { padding: '8px 12px', borderBottom: '1px solid #e5e7eb' },
};
