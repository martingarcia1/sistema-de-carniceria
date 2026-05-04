import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import ReceiptTemplate from '../components/ReceiptTemplate';
import './PuntoVenta.css';

const PuntoVenta = () => {
  const receiptRef = useRef();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'historial'

  // POS State
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodoPagoGlobal, setMetodoPagoGlobal] = useState(1); // 1=Efectivo, 2=Tarjeta, 3=MP, 4=Transf
  const [loadingBalanza, setLoadingBalanza] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Historial State
  const [historialVentas, setHistorialVentas] = useState([]);

  // Caja State
  const [cajaData, setCajaData] = useState(null);

  // Form Activo
  const [itemActual, setItemActual] = useState({
    productoId: '',
    kg: '',
    precioVentaKg: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null); // null = Todos

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchHistorial();
    } else if (activeTab === 'caja') {
      fetchCajaDiaria();
    }
  }, [activeTab]);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/mercaderia/productos');
      if (res.ok) {
        setProductos(await res.json());
      }
    } catch {
      toast.error('Error al cargar productos');
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/ventas');
      if (res.ok) {
        setHistorialVentas(await res.json());
      }
    } catch {
      toast.error('Error al cargar historial de ventas');
    }
  };

  const fetchCajaDiaria = async () => {
    try {
      const res = await fetch('/api/ventas/caja-diaria');
      if (res.ok) {
        setCajaData(await res.json());
      }
    } catch {
      toast.error('Error al cargar datos de la caja');
    }
  };

  const leerBalanza = async () => {
    setLoadingBalanza(true);
    try {
      const res = await fetch('/api/balanza/weight').catch(() => fetch('/api/scale/weight'));
      if(res && res.ok) {
         const data = await res.json();
         const peso = data.weight || data;
         setItemActual(p => ({ ...p, kg: peso }));
         toast.success(`Leído: ${peso} kg`);
      } else {
         toast.error('Balanza no conectada');
      }
    } catch {
      toast.error('Falló lectura de peso');
    } finally {
      setLoadingBalanza(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemActual(p => ({ ...p, [name]: value }));
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    // Escáner Láser dispara esto rápidamente. Revisamos si es match exacto:
    const productoPorCodigo = productos.find(p => p.codigoBarra && p.codigoBarra === val);
    if (productoPorCodigo) {
      setItemActual(prev => ({ 
        ...prev, 
        productoId: productoPorCodigo.id,
        precioVentaKg: productoPorCodigo.precioVentaKg || '' 
      }));
      toast.success(`Escaneado: ${productoPorCodigo.nombre}`);
      setSearchTerm(''); // Limpiar input para próximo escaneo
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (p.codigoBarra && p.codigoBarra.includes(searchTerm));
    
    if (!matchSearch) return false;
    if (categoriaSeleccionada === null) return true;
    if (categoriaSeleccionada === 7) return p.tipo === 7 || p.tipo === 2; // Embutidos + Elaborados
    return p.tipo === categoriaSeleccionada;
  });

  const seleccionarProductoGrid = (prod) => {
    setItemActual(p => ({
      ...p,
      productoId: prod.id,
      precioVentaKg: prod.precioVentaKg || ''
    }));
  };

  const agregarAlCarrito = () => {
    if (!itemActual.productoId || !itemActual.kg || !itemActual.precioVentaKg) return;
    
    const prod = productos.find(p => p.id === parseInt(itemActual.productoId));
    if (!prod) return;

    const kg = parseFloat(itemActual.kg);
    const precio = parseFloat(itemActual.precioVentaKg);

    const nuevoItem = {
      idUnico: Date.now(), // Para poder eliminar de la lista visual
      productoId: prod.id,
      name: prod.nombre,
      quantity: kg,
      priceVentaKg: precio,
      price: (kg * precio) 
    };

    setCarrito(prev => [...prev, nuevoItem]);
    
    // Resetear form para el próximo item, pero mantener el último precio es buena UX a veces.
    // Lo reseteamos para forzar lectura.
    setItemActual({ productoId: '', kg: '', precioVentaKg: '' });
  };

  const quitarDelCarrito = (idUnico) => {
    setCarrito(prev => prev.filter(i => i.idUnico !== idUnico));
  };

  const totalCarrito = carrito.reduce((acc, current) => acc + current.price, 0);

  // Hook para imprimir recibo
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Ticket_Carniceria_${Date.now()}`
  });

  const finalizarVenta = async () => {
    if (carrito.length === 0) return toast.error('El carrito está vacío');
    
    setIsProcessing(true);
    try {
      // El backend registra ventas por item individual (dto: ProductoId, Kg, PrecioVentaKg).
      // Enviamos en paralelo o en secuencia.
      const promesasVenta = carrito.map(item => {
        const dto = {
          productoId: item.productoId,
          kg: item.quantity,
          precioVentaKg: item.priceVentaKg,
          observacion: 'Venta por mostrador',
          metodoPago: metodoPagoGlobal
        };
        return fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        }).then(res => {
          if (!res.ok) throw new Error('Falló item');
          return res.json();
        });
      });

      await Promise.all(promesasVenta);
      toast.success('Venta registrada exitosamente', { duration: 3000 });
      
      // Imprimir!
      handlePrint();

      // Limpiar
      setCarrito([]);
    } catch {
      toast.error('Ocurrió un error al procesar algunos artículos');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pos-container">
      <div className="pos-header">
        <div>
          <h1>Punto de Venta</h1>
          <p style={{color: '#a0a0a0', margin: '5px 0 0 0'}}>Descuenta stock automáticamente</p>
        </div>
      </div>

      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>Caja / Mostrador</button>
        <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>Historial de Egresos</button>
        <button className={`tab-btn ${activeTab === 'caja' ? 'active' : ''}`} onClick={() => setActiveTab('caja')}>Cierre de Caja Diaria</button>
      </div>

      {activeTab === 'pos' && (
        <div className="pos-layout animate-fade-in">
          <div className="pos-controls">
            <h2>Agregar Producto</h2>
            
            <div className="form-group">
              
              <input 
                type="text" 
                className="form-control" 
                placeholder="Escanea Código de Barra o Busca por nombre..." 
                value={searchTerm}
                onChange={handleSearchChange}
                style={{marginBottom: '15px'}}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === null ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(null)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>📦 Todos</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 1 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(1)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🥩 Vacuno</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 3 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(3)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🐔 Pollo</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 4 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(4)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🐷 Cerdo</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 5 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(5)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🥩 Achuras</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 6 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(6)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🧊 Congel</button>
                <button type="button" className={`mode-btn ${categoriaSeleccionada === 7 ? 'active' : ''}`} onClick={() => setCategoriaSeleccionada(7)} style={{padding:'8px 12px', fontSize:'0.85rem'}}>🌭 Embut</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '5px', marginBottom: '15px' }}>
                {productosFiltrados.map(p => (
                  <button 
                    key={p.id} 
                    type="button"
                    onClick={() => seleccionarProductoGrid(p)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: itemActual.productoId == p.id ? '2px solid #3b82f6' : '1px solid #2d303a',
                      background: itemActual.productoId == p.id ? 'rgba(59, 130, 246, 0.15)' : '#181a20',
                      color: itemActual.productoId == p.id ? '#3b82f6' : '#f3f4f6',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: '80px',
                      transition: 'all 0.2s'
                    }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: '1.2', marginBottom: '6px' }}>{p.nombre}</span>
                    <span style={{ fontSize: '0.75rem', color: p.stockKg > 0 ? '#10b981' : '#ef4444' }}>
                      {p.stockKg} kg
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Balanza (KG)</label>
                <div className="scale-integration">
                  <div className="scale-input-wrapper">
                    <input type="number" name="kg" step="0.001" className="form-control" placeholder="0.000" value={itemActual.kg} onChange={handleInputChange} style={{fontSize: '1.2rem'}} />
                    <span className="unit">KG</span>
                  </div>
                  <button type="button" className="btn-scale" onClick={leerBalanza} disabled={loadingBalanza} style={{padding: '0 15px'}}>Pesar</button>
                </div>
              </div>
              <div className="form-group">
                <label>Precio Venta / Kg</label>
                <div style={{position: 'relative'}}>
                  <span style={{position: 'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#a0a0a0'}}>$</span>
                  <input style={{paddingLeft: '35px'}} type="number" name="precioVentaKg" step="0.01" className="form-control" placeholder="0.00" value={itemActual.precioVentaKg} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-add" 
              onClick={agregarAlCarrito}
              disabled={!itemActual.productoId || !itemActual.kg || !itemActual.precioVentaKg}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Cargar al Ticket
            </button>
          </div>

          <div className="pos-cart">
            <h2 style={{margin:0}}>Ticket Actual</h2>
            
            <div className="cart-items">
              {carrito.length === 0 ? (
                <div style={{textAlign: 'center', color: '#6b7280', marginTop: '40px'}}>El carrito está vacío</div>
              ) : (
                carrito.map(item => (
                  <div className="cart-item" key={item.idUnico}>
                    <div className="item-details">
                      <strong>{item.name}</strong>
                      <span>{item.quantity} kg x ${item.priceVentaKg.toFixed(2)}/kg</span>
                    </div>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                    <button className="btn-remove" onClick={() => quitarDelCarrito(item.idUnico)}>X</button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-total">
              <span>TOTAL</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Método de Pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" className={`mode-btn ${metodoPagoGlobal === 1 ? 'active' : ''}`} onClick={() => setMetodoPagoGlobal(1)} style={{padding:'10px', fontSize:'0.9rem'}}>💵 Efectivo</button>
                <button type="button" className={`mode-btn ${metodoPagoGlobal === 2 ? 'active' : ''}`} onClick={() => setMetodoPagoGlobal(2)} style={{padding:'10px', fontSize:'0.9rem'}}>💳 Tarjeta</button>
                <button type="button" className={`mode-btn ${metodoPagoGlobal === 3 ? 'active' : ''}`} onClick={() => setMetodoPagoGlobal(3)} style={{padding:'10px', fontSize:'0.9rem'}}>📱 M. Pago</button>
                <button type="button" className={`mode-btn ${metodoPagoGlobal === 4 ? 'active' : ''}`} onClick={() => setMetodoPagoGlobal(4)} style={{padding:'10px', fontSize:'0.9rem'}}>🏦 Transf.</button>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-checkout" 
              onClick={finalizarVenta}
              disabled={carrito.length === 0 || isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Cobrar & Imprimir Ticket'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="history-layout animate-fade-in">
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Venta</th>
                  <th>Método Pago</th>
                  <th>Importe Total</th>
                </tr>
              </thead>
              <tbody>
                {historialVentas.length === 0 ? (
                  <tr><td colSpan="7" style={{textAlign:'center', color:'#a0a0a0'}}>Cargando o sin historial</td></tr>
                ) : (
                  historialVentas.map((v, i) => (
                    <tr key={i}>
                      <td style={{color: '#3b82f6'}}>#{v.id}</td>
                      <td>{new Date(v.fecha).toLocaleString()}</td>
                      <td style={{fontWeight: 'bold'}}>{v.productoNombre}</td>
                      <td>{v.kg} kg</td>
                      <td>${v.precioVentaKg?.toFixed(2)}/kg</td>
                      <td>{v.metodoPagoDescripcion || 'Efectivo'}</td>
                      <td style={{color: '#10b981', fontWeight: 'bold'}}>${v.total?.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'caja' && (
        <div className="caja-layout animate-fade-in" style={{ padding: '20px' }}>
          <h2 style={{marginTop: 0}}>Cierre de Caja Diaria (Z-Read)</h2>
          <p style={{color: '#9ca3af', marginBottom: '30px'}}>Resumen de ingresos agrupados por método de pago para el día de hoy.</p>
          
          {!cajaData ? (
            <div style={{color: '#9ca3af'}}>Cargando métricas de la caja...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              
              <div className="kpi-card" style={{ borderTop: '4px solid #10b981', background: '#181a20', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '1rem' }}>💵 Efectivo (En Cajón)</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${cajaData.totalEfectivo.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Dinero físico a rendir</p>
              </div>

              <div className="kpi-card" style={{ borderTop: '4px solid #3b82f6', background: '#181a20', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '1rem' }}>💳 Tarjetas</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>${cajaData.totalTarjeta.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Débito y Crédito</p>
              </div>

              <div className="kpi-card" style={{ borderTop: '4px solid #009ee3', background: '#181a20', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '1rem' }}>📱 Mercado Pago</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#009ee3' }}>${cajaData.totalMercadoPago.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>QR y Transferencias MP</p>
              </div>

              <div className="kpi-card" style={{ borderTop: '4px solid #8b5cf6', background: '#181a20', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '1rem' }}>🏦 Transferencias</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>${cajaData.totalTransferencia.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Bancos CBU/CVU</p>
              </div>

              <div className="kpi-card" style={{ gridColumn: '1 / -1', borderTop: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '20px', borderRadius: '10px', marginTop: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b', fontSize: '1.2rem' }}>💰 TOTAL RECAUDADO</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>${cajaData.totalGeneral.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#9ca3af' }}>Suma de todos los medios de pago</p>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Hidden layout to Print via react-to-print */}
      <div style={{ display: 'none' }}>
        <ReceiptTemplate ref={receiptRef} items={carrito} total={totalCarrito} />
      </div>
    </div>
  );
};

export default PuntoVenta;
