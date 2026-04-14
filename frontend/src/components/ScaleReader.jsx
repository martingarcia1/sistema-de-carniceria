import React, { useState } from 'react';

const ScaleReader = ({ onWeightRead }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReadScale = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/scale/weight');
      if (!response.ok) throw new Error('Error al conectar con la balanza');
      const data = await response.json();
      onWeightRead(data.weight);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button 
        type="button"
        onClick={handleReadScale}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Leyendo...' : 'Leer Balanza'}
      </button>
      {error && <span style={{ color: 'red', fontSize: '0.9em' }}>{error}</span>}
    </div>
  );
};

export default ScaleReader;
