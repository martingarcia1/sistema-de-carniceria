export default function ConfirmDialog({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.caja}>
        <p style={styles.texto}>{mensaje}</p>
        <div style={styles.botones}>
          <button style={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
          <button style={styles.btnConfirmar} onClick={onConfirmar}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  caja: { background: '#fff', padding: 32, borderRadius: 10, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  texto: { fontSize: 16, marginBottom: 24, color: '#111827' },
  botones: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnCancelar: { padding: '8px 18px', borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer', background: '#fff' },
  btnConfirmar: { padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#dc2626', color: '#fff' },
};
