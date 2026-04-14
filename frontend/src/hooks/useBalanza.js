import { useEffect, useState } from 'react';
import { iniciarConexion, getConnection } from '../services/signalrService';

export function useBalanza() {
  const [peso, setPeso] = useState(null);
  const [conectada, setConectada] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let conn;

    iniciarConexion()
      .then((c) => {
        conn = c;
        setConectada(true);
        conn.on('PesoActualizado', (valor) => {
          setPeso(parseFloat(valor.toFixed(3)));
        });
        conn.onreconnected(() => setConectada(true));
        conn.onreconnecting(() => setConectada(false));
        conn.onclose(() => setConectada(false));
      })
      .catch((err) => {
        setError('No se pudo conectar con el servidor de balanza');
        console.error(err);
      });

    return () => {
      const c = getConnection();
      c?.off('PesoActualizado');
    };
  }, []);

  return { peso, conectada, error };
}
