import { useBalanza } from '../hooks/useBalanza';

export default function BalanzaDisplay({ onPesoAceptado }) {
  const { peso, conectada, error } = useBalanza();

  return (
    <div style={styles.contenedor}>
      <div style={styles.indicador(conectada)}>
        {conectada ? 'Balanza conectada' : 'Balanza desconectada'}
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.peso}>
        {peso !== null ? `${peso.toFixed(3)} kg` : '— kg'}
      </div>
      {onPesoAceptado && peso !== null && (
        <button style={styles.btn} onClick={() => onPesoAceptado(peso)}>
          Usar este peso
        </button>
      )}
    </div>
  );
}

const styles = {
  contenedor: {
    border: '2px solid #ccc',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center',
    minWidth: 180,
    background: '#f9f9f9',
  },
  indicador: (ok) => ({
    fontSize: 12,
    color: ok ? '#16a34a' : '#dc2626',
    marginBottom: 8,
  }),
  peso: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    margin: '8px 0',
  },
  btn: {
    marginTop: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
  },
  error: { color: '#dc2626', fontSize: 12 },
};
