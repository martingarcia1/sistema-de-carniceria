import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import IngresoPage from '../pages/Ingreso/IngresoPage';
import VentasPage from '../pages/Ventas/VentasPage';
import ElaboracionPage from '../pages/Elaboracion/ElaboracionPage';
import RecetasPage from '../pages/Elaboracion/RecetasPage';
import MetricasPage from '../pages/Metricas/MetricasPage';

const navItems = [
  { to: '/', label: 'Ingreso' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/elaboracion', label: 'Elaboración' },
  { to: '/recetas', label: 'Recetas' },
  { to: '/metricas', label: 'Métricas' },
];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <span style={styles.logo}>Carnicería</span>
        <div style={styles.links}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<IngresoPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/elaboracion" element={<ElaboracionPage />} />
          <Route path="/recetas" element={<RecetasPage />} />
          <Route path="/metricas" element={<MetricasPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const styles = {
  nav: { background: '#1e3a5f', display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, gap: 32 },
  logo: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
  links: { display: 'flex', gap: 4 },
  link: { color: '#93c5fd', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 14 },
  linkActive: { background: '#2563eb', color: '#fff' },
  main: { minHeight: 'calc(100vh - 56px)', background: '#f8fafc' },
};
