import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PuntoVenta from './pages/PuntoVenta';
import IngresoMercaderia from './pages/IngresoMercaderia';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#0f1014' }}>
        <Toaster position="top-right" />
        <nav style={{ width: '260px', background: '#181a20', color: 'white', padding: '30px 20px', borderRight: '1px solid #2d303a' }}>
          <h2 style={{marginTop: 0, color: '#f3f4f6', fontSize: '1.4rem'}}>🍖 Carnicería</h2>
          <hr style={{ borderTop: '1px solid #2d303a', margin: '20px 0' }} />
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '20px 0' }}>
              <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 500, fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#9ca3af'}>🏠 Inicio</Link>
            </li>
            <li style={{ margin: '20px 0' }}>
              <Link to="/ingreso" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 500, fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#9ca3af'}>📥 Ingreso Mercadería</Link>
            </li>
            <li style={{ margin: '20px 0' }}>
              <Link to="/pos" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 500, fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#9ca3af'}>💸 Punto de Venta (Egreso)</Link>
            </li>
          </ul>
        </nav>
        <main style={{ flex: 1, backgroundColor: '#0f1014', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<div style={{padding: '40px', color: '#f3f4f6'}}><h1>Panel Principal</h1><p>Seleccione una opción en el menú lateral.</p></div>} />
            <Route path="/ingreso" element={<IngresoMercaderia />} />
            <Route path="/pos" element={<PuntoVenta />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
