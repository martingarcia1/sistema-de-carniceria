import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './IngresoMercaderia.css';
import { toast } from 'react-hot-toast';

const RENDIMIENTO_BASE_KG = 98.0;
const cortesTemplate = [
  { nombre: "Tortuguita", base: 1.500 }, { nombre: "Cuadrada", base: 3.800 },
  { nombre: "Picana", base: 1.000 }, { nombre: "Peceto", base: 1.500 },
  { nombre: "Bola de lomo", base: 3.300 }, { nombre: "Filet", base: 1.500 },
  { nombre: "Nalga", base: 4.400 }, { nombre: "Tapa de nalga", base: 2.000 },
  { nombre: "Verija", base: 2.800 }, { nombre: "Punta de verija", base: 0.800 },
  { nombre: "Osobuco", base: 4.800 }, { nombre: "Costeleta chata", base: 3.700 },
  { nombre: "Vacio", base: 3.000 }, { nombre: "Matambre", base: 1.300 },
  { nombre: "Jamon de paleta", base: 0.900 }, { nombre: "Paleta chata", base: 1.500 },
  { nombre: "Paleta royiza", base: 2.500 }, { nombre: "Entraña", base: 0.400 },
  { nombre: "Tapa de asado", base: 2.700 }, { nombre: "Poncho", base: 3.500 },
  { nombre: "Alita", base: 2.000 }, { nombre: "Costeletas royiza", base: 5.000 },
  { nombre: "Falda parrillera", base: 1.300 }, { nombre: "Costilla palomita", base: 6.000 },
  { nombre: "Costilla especial", base: 3.000 }, { nombre: "Primo", base: 5.500 },
  { nombre: "Molida", base: 2.000 }, { nombre: "Punta de lomo", base: 2.000 },
  { nombre: "Puchero comun", base: 9.000 }, { nombre: "Hueso", base: 6.000 },
  { nombre: "Grasa", base: 6.000 }, { nombre: "Desperdicio Faena", base: 3.300 }
];

const IngresoMercaderia = () => {
  const { categoria } = useParams();

  const [activeTab, setActiveTab] = useState('registrar');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalanza, setLoadingBalanza] = useState(false);
  const [historial, setHistorial] = useState([]);

  // Lote y Desposte
  const [loteIngreso, setLoteIngreso] = useState([]);
  const [editableCortes, setEditableCortes] = useState([]);

  const [modoIngreso, setModoIngreso] = useState('pieza_entera');

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');

  const [formData, setFormData] = useState({
    productoId: '',
    kg: '',
    precioTotalCompra: '',
    precioCostoKg: '', 
    precioVentaKg: '',
    observacion: ''
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchHistorial();
    }
  }, [activeTab]);

  useEffect(() => {
    setFormData({ productoId: '', kg: '', precioTotalCompra: '', precioCostoKg: '', precioVentaKg: '', observacion: '' });
    setEditableCortes([]);
    setShowNewProduct(false);
    if (categoria === 'vacuno' || !categoria) {
      setModoIngreso('pieza_entera');
    } else {
      setModoIngreso('corte');
    }
  }, [categoria]);

  // Recalcular desposte si cambia el kilo total y estamos en modo desposte
  useEffect(() => {
    if (modoIngreso === 'desposte' && formData.kg) {
      const kgVal = parseFloat(formData.kg) || 0;
      const calc = cortesTemplate.map(c => {
         const factor = c.base / RENDIMIENTO_BASE_KG;
         const kgCalculado = kgVal * factor;
         const productoMatches = productos.filter(p => p.nombre.toLowerCase() === c.nombre.toLowerCase());
         return {
           nombre: c.nombre,
           productoId: productoMatches.length > 0 ? productoMatches[0].id : 0,
           kgCalculado: parseFloat(kgCalculado.toFixed(3))
         };
      });
      setEditableCortes(calc);
    } else if (modoIngreso === 'desposte' && !formData.kg) {
      setEditableCortes([]);
    }
  }, [formData.kg, modoIngreso, productos]);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/mercaderia/productos');
      if (res.ok) setProductos(await res.json());
    } catch {
      toast.error('Error al cargar la lista de productos');
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/mercaderia/ingresos');
      if (res.ok) setHistorial(await res.json());
    } catch {
      toast.error('Error al cargar historial');
    }
  };

  const handleSeedCortes = async () => {
    if (!window.confirm("¿Deseas poblar el catálogo?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mercaderia/seed-cortes', { method: 'POST' });
      if (res.ok) {
        toast.success("¡Catálogo configurado!");
        fetchProductos();
      } else {
        toast.error('Error al configurar catálogo');
      }
    } catch {
      toast.error('Error de red al inicializar catálogo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;
    try {
      const res = await fetch('/api/mercaderia/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newProductName, tipo: 1, codigoBarra: newProductBarcode }) 
      });
      if (res.ok) {
        const newProd = await res.json();
        setProductos(prev => [...prev, newProd]);
        setFormData(prev => ({ ...prev, productoId: newProd.id }));
        setShowNewProduct(false);
        setNewProductName('');
        setNewProductBarcode('');
        toast.success(`Producto creado exitosamente`);
      } else {
        toast.error('Fallo al crear producto');
      }
    } catch {
      toast.error('Error de red al crear producto');
    }
  };

  const leerBalanza = async () => {
    setLoadingBalanza(true);
    try {
      const res = await fetch('/api/balanza/weight').catch(() => fetch('/api/scale/weight'));
      if(res && res.ok) {
         const data = await res.json();
         const peso = data.weight || data;
         setFormData(prev => ({ ...prev, kg: peso }));
         toast.success(`Peso leído: ${peso} kg`);
      } else {
         toast.error('Balanza no lista o no detectada');
      }
    } catch {
      toast.error('Falló comunicación serial');
    } finally {
      setLoadingBalanza(false);
    }
  };

  const getCostoPorKgEstimado = () => {
    const kg = Number(formData.kg) || 0;
    if (modoIngreso === 'pieza_entera' || modoIngreso === 'desposte') {
      const total = Number(formData.precioTotalCompra) || 0;
      return (kg > 0 && total > 0) ? (total / kg).toFixed(2) : '0.00';
    } else {
      return Number(formData.precioCostoKg || 0).toFixed(2);
    }
  };

  const getPrecioTotalEstimado = () => {
    const kg = Number(formData.kg) || 0;
    if (modoIngreso === 'pieza_entera' || modoIngreso === 'desposte') {
      return Number(formData.precioTotalCompra || 0).toFixed(2);
    } else {
      const costoKg = Number(formData.precioCostoKg) || 0;
      return (kg * costoKg).toFixed(2);
    }
  };

  const handleAgregarAlLote = (e) => {
    e.preventDefault();
    const kgVal = parseFloat(formData.kg);

    if (modoIngreso === 'desposte') {
      if (!formData.precioTotalCompra || !formData.kg) return toast.error('Ingrese Kilos Totales y Precio Total');
      const missing = editableCortes.filter(c => c.productoId === 0);
      if (missing.length > 0) return toast.error(`Faltan ${missing.length} productos en el catálogo (Ej: ${missing[0].nombre}). Usa el botón de Sembrar Catálogo primero.`);

      setLoteIngreso([...loteIngreso, {
        idVirtual: Date.now(),
        isDesposte: true,
        pesoTotalMediaRes: kgVal,
        costoTotal: parseFloat(formData.precioTotalCompra),
        observacion: formData.observacion || 'Desposte Automático',
        cortes: editableCortes,
        displayName: `🥩 Desposte Media Res (${kgVal}kg)`
      }]);
      setFormData({ productoId: '', kg: '', precioTotalCompra: '', precioCostoKg: '', precioVentaKg: '', observacion: '' });
      setEditableCortes([]);
      toast.success('Desposte agregado a la bandeja.');
      return;
    }

    if (!formData.productoId || !formData.kg) {
      return toast.error('Seleccione un producto y cantidad');
    }

    let totalCompraVal = 0;
    if (modoIngreso === 'pieza_entera') {
      if (!formData.precioTotalCompra) return toast.error('Especifique el costo total');
      totalCompraVal = parseFloat(formData.precioTotalCompra);
    } else {
      if (!formData.precioCostoKg) return toast.error('Especifique el costo por Kg');
      totalCompraVal = kgVal * parseFloat(formData.precioCostoKg);
    }

    const prodNombre = productos.find(p => p.id === parseInt(formData.productoId))?.nombre || 'Producto';
    
    setLoteIngreso([...loteIngreso, {
      idVirtual: Date.now(),
      isDesposte: false,
      productoId: parseInt(formData.productoId),
      kg: kgVal,
      precioTotalCompra: totalCompraVal,
      precioVentaKg: formData.precioVentaKg ? parseFloat(formData.precioVentaKg) : null,
      observacion: formData.observacion,
      displayName: `📦 ${prodNombre} (${kgVal}kg)`
    }]);

    setFormData({ productoId: '', kg: '', precioTotalCompra: '', precioCostoKg: '', precioVentaKg: '', observacion: '' });
    toast.success(`${prodNombre} a la bandeja`);
  };

  const handleEliminarDelLote = (idVirtual) => {
    setLoteIngreso(loteIngreso.filter(item => item.idVirtual !== idVirtual));
  };

  const handleConfirmarLote = async () => {
    if (loteIngreso.length === 0) return toast.error('La bandeja está vacía');
    setLoading(true);
    
    try {
      const normales = loteIngreso.filter(i => !i.isDesposte);
      const despostes = loteIngreso.filter(i => i.isDesposte);

      // Guardar bulk normales
      if (normales.length > 0) {
        const payloadNormales = normales.map(n => ({
          productoId: n.productoId,
          kg: n.kg,
          precioTotalCompra: n.precioTotalCompra,
          precioVentaKg: n.precioVentaKg,
          observacion: n.observacion
        }));
        const resN = await fetch('/api/mercaderia/ingresos/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadNormales)
        });
        if (!resN.ok) throw new Error('Error al guardar ingresos normales');
      }

      // Guardar despostes
      for (let d of despostes) {
        const payloadD = {
          pesoTotalMediaRes: d.pesoTotalMediaRes,
          costoTotal: d.costoTotal,
          observacion: d.observacion,
          cortes: d.cortes.map(c => ({ productoId: c.productoId, kgCalculado: c.kgCalculado }))
        };
        const resD = await fetch('/api/mercaderia/desposte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadD)
        });
        if (!resD.ok) throw new Error('Error al guardar desposte de media res');
      }

      toast.success('¡Lote completo guardado exitosamente en BD!');
      setLoteIngreso([]);
    } catch (err) {
      toast.error(err.message || 'Error de red al procesar el lote');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaFiltro = () => {
    switch(categoria) {
      case 'vacuno': return 1;
      case 'pollo': return 3;
      case 'cerdo': return 4;
      case 'achuras': return 5;
      case 'congelados': return 6;
      case 'embutidos': return 7;
      default: return null;
    }
  };

  const tipoFiltro = getCategoriaFiltro();
  const productosFiltrados = productos.filter(p => {
    if (!tipoFiltro) return true;
    if (categoria === 'embutidos') return p.tipo === 7 || p.tipo === 2;
    return p.tipo === tipoFiltro;
  });

  const historialFiltrado = historial.filter(item => {
    if (!tipoFiltro) return true;
    const prod = productos.find(p => p.nombre === item.productoNombre);
    if (!prod) return true;
    if (categoria === 'embutidos') return prod.tipo === 7 || prod.tipo === 2;
    return prod.tipo === tipoFiltro;
  });

  const getEmojiForCategory = () => {
    switch(categoria) {
      case 'vacuno': return '🥩';
      case 'pollo': return '🐔';
      case 'cerdo': return '🐷';
      case 'achuras': return '🥩';
      case 'congelados': return '🧊';
      case 'embutidos': return '🌭';
      default: return '📦';
    }
  };

  return (
    <div className="ingreso-container">
      <div className="ingreso-header" style={{ position: 'relative' }}>
        <h1>Centro de Recepción {categoria && `> ${categoria.toUpperCase()}`}</h1>
        <p>Registre ingresos estilo Punto de Venta (Múltiples elementos en lote)</p>
        <button type="button" onClick={handleSeedCortes} style={{ position: 'absolute', right: 0, top: 0, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
          🌱 Sembrar Catálogo Completo
        </button>
      </div>

      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'registrar' ? 'active' : ''}`} onClick={() => setActiveTab('registrar')}>Modo POS (Carga Rápida)</button>
        <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>Historial de Ingresos</button>
      </div>

      {activeTab === 'registrar' && (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 2, background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
              {(categoria === 'vacuno' || !categoria) && (
                <div className="ingreso-mode-toggle" style={{display: 'flex', flexWrap: 'wrap'}}>
                  <button type="button" className={`mode-btn ${modoIngreso === 'desposte' ? 'active' : ''}`} onClick={() => { setModoIngreso('desposte'); setFormData(p => ({...p, precioCostoKg: ''})); }}>
                    🔪 Auto-Desposte Editable (Media Res)
                  </button>
                  <button type="button" className={`mode-btn ${modoIngreso === 'pieza_entera' ? 'active' : ''}`} onClick={() => { setModoIngreso('pieza_entera'); setFormData(p => ({...p, precioCostoKg: ''})); }}>
                    🥩 Bulto Entero Individual
                  </button>
                  <button type="button" className={`mode-btn ${modoIngreso === 'corte' ? 'active' : ''}`} onClick={() => { setModoIngreso('corte'); setFormData(p => ({...p, precioTotalCompra: ''})); }}>
                    🥩 Corte específico / Insumo
                  </button>
                </div>
              )}

              <form onSubmit={handleAgregarAlLote}>
                
                {modoIngreso !== 'desposte' && (
                  <div className="form-group" style={{ marginBottom: '25px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#e5e7eb' }}>1. Seleccionar Producto</h3>
                    
                    {!showNewProduct ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                        {productosFiltrados.map(p => (
                          <button 
                            key={p.id} 
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, productoId: p.id}))}
                            style={{ 
                              padding: '10px', 
                              borderRadius: '8px', 
                              border: formData.productoId == p.id ? '2px solid #10b981' : '1px solid #2d303a',
                              background: formData.productoId == p.id ? 'rgba(16, 185, 129, 0.15)' : '#181a20',
                              color: formData.productoId == p.id ? '#10b981' : '#f3f4f6',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              minHeight: '80px',
                              transition: 'all 0.2s'
                            }}>
                            <span style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{getEmojiForCategory()}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: '1.2' }}>{p.nombre}</span>
                          </button>
                        ))}
                        <button type="button" onClick={() => setShowNewProduct(true)} style={{ background: 'rgba(255, 138, 0, 0.1)', border: '1px dashed #ff8a00', color: '#ff8a00', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          + Nuevo
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: '#181a20', padding: '15px', borderRadius: '8px', border: '1px solid #2d303a' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#ff8a00' }}>Crear Nuevo Producto en el Catálogo</h4>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" className="form-control" placeholder="Nombre del nuevo producto..." value={newProductName} onChange={e => setNewProductName(e.target.value)} autoFocus />
                            <input type="text" className="form-control" placeholder="Código de Barra (opcional)..." value={newProductBarcode} onChange={e => setNewProductBarcode(e.target.value)} />
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
                            <button type="button" onClick={handleCreateProduct} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar e Iniciar Ingreso</button>
                            <button type="button" onClick={() => setShowNewProduct(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(formData.productoId || modoIngreso === 'desposte') && (
                  <div className="animate-fade-in" style={{ background: '#181a20', padding: '20px', borderRadius: '12px', border: '1px solid #2d303a' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#e5e7eb' }}>2. Pesaje y Costos</h3>
                    
                    <div className="form-group">
                      <label>{modoIngreso === 'desposte' ? 'PESO TOTAL DE LA MEDIA RES' : 'PESO EN BALANZA'}</label>
                      <div className="scale-integration">
                        <div className="scale-input-wrapper">
                          <input type="number" name="kg" step="0.001" className="form-control" placeholder="0.000" value={formData.kg} onChange={handleInputChange} style={{ fontSize: '1.2rem', fontWeight: 'bold' }} required />
                          <span className="unit">KG</span>
                        </div>
                        <button type="button" className="btn-scale" onClick={leerBalanza} disabled={loadingBalanza}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="14" width="18" height="8" rx="2"/><path d="M12 14v-4"/><path d="M8 8h8l1-4H7l1 4z"/></svg>
                          Pesar
                        </button>
                      </div>
                    </div>

                    <div className="form-row">
                      {modoIngreso === 'pieza_entera' || modoIngreso === 'desposte' ? (
                        <div className="form-group animate-fade-in">
                          <label>Monto Facturado/Pagado (por todo el bulto)</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0a0a0' }}>$</span>
                            <input style={{ paddingLeft: '35px' }} type="number" name="precioTotalCompra" step="0.01" className="form-control" placeholder="0.00" value={formData.precioTotalCompra} onChange={handleInputChange} required />
                          </div>
                        </div>
                      ) : (
                        <div className="form-group animate-fade-in" style={{ display: 'flex', gap: '15px' }}>
                          <div style={{ flex: 1 }}>
                            <label>Costo Pagado por KG (Proveedor)</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0a0a0' }}>$</span>
                              <input style={{ paddingLeft: '35px' }} type="number" name="precioCostoKg" step="0.01" className="form-control" placeholder="0.00" value={formData.precioCostoKg} onChange={handleInputChange} required />
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Precio de Venta al Público x KG</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0a0a0' }}>$</span>
                              <input style={{ paddingLeft: '35px', borderColor: '#10b981' }} type="number" name="precioVentaKg" step="0.01" className="form-control" placeholder="0.00" value={formData.precioVentaKg} onChange={handleInputChange} required />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {modoIngreso === 'desposte' && editableCortes.length > 0 && (
                      <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: '#93c5fd' }}>Tabla de Desposte Editable</h3>
                          <span style={{ fontSize: '0.85rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                            Kilos Base: {formData.kg}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '5px' }}>
                          {editableCortes.map((c, index) => {
                            const isWaste = c.nombre === "Desperdicio Faena" || c.nombre === "Hueso" || c.nombre === "Grasa";
                            return (
                              <div key={index} style={{ 
                                background: isWaste ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', 
                                border: isWaste ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                <span style={{ color: isWaste ? '#fca5a5' : '#d1d1d1', fontSize: '0.85rem', fontWeight: '500' }}>{c.nombre}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input 
                                    type="number" step="0.001"
                                    value={c.kgCalculado}
                                    onChange={(e) => {
                                      const newCortes = [...editableCortes];
                                      newCortes[index].kgCalculado = parseFloat(e.target.value) || 0;
                                      setEditableCortes(newCortes);
                                    }}
                                    style={{ width: '70px', padding: '4px', textAlign: 'right', background: 'rgba(0,0,0,0.5)', color: isWaste ? '#ef4444' : '#10b981', border: '1px solid #3b82f6', borderRadius: '4px', fontWeight: 'bold' }}
                                  />
                                  <span style={{fontSize: '0.7rem', color: '#6b7280'}}>kg</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn-submit" style={{ marginTop: '20px', background: '#3b82f6', border: 'none' }}>
                      + AGREGAR A LA BANDEJA (CARRITO)
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* PANEL LATERAL DERECHO: LOTE/CARRITO */}
            <div style={{ flex: 1, background: '#181a20', padding: '20px', borderRadius: '12px', border: '1px solid #2d303a', minWidth: '320px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                🛒 Bandeja de Carga 
                <span style={{ background: '#3b82f6', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem' }}>{loteIngreso.length}</span>
              </h2>
              
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loteIngreso.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', fontStyle: 'italic' }}>
                    La bandeja está vacía.<br/>Pesa productos y agrégalos aquí.
                  </div>
                ) : (
                  loteIngreso.map(item => (
                    <div key={item.idVirtual} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #374151', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: item.isDesposte ? '#60a5fa' : '#f3f4f6', fontSize: '0.95rem' }}>{item.displayName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                          {!item.isDesposte && `Costo T: $${item.precioTotalCompra?.toFixed(2)}`}
                          {!item.isDesposte && item.precioVentaKg && ` | Venta: $${item.precioVentaKg}/kg`}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleEliminarDelLote(item.idVirtual)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
                <button 
                  type="button" 
                  onClick={handleConfirmarLote}
                  disabled={loteIngreso.length === 0 || loading}
                  style={{ 
                    width: '100%', padding: '16px', background: loteIngreso.length > 0 ? '#10b981' : '#374151', 
                    color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', 
                    cursor: loteIngreso.length > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
                    boxShadow: loteIngreso.length > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
                  }}
                >
                  {loading ? 'GUARDANDO LOTE...' : 'CONFIRMAR Y GUARDAR LOTE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="animate-fade-in">
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Cod.</th>
                  <th>Fecha/Hora</th>
                  <th>Producto</th>
                  <th>Cant. (Kg)</th>
                  <th>Costo Prom/Kg</th>
                  <th>Importe Total</th>
                  <th>Ref</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.length === 0 ? (
                  <tr><td colSpan="7" style={{textAlign:'center', color: '#a0a0a0'}}>No hay ingresos recientes registrados en esta categoría</td></tr>
                ) : (
                  historialFiltrado.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{color: '#60a5fa'}}>#{item.id}</td>
                      <td>{new Date(item.fecha).toLocaleString()}</td>
                      <td style={{fontWeight: 'bold'}}>{item.productoNombre}</td>
                      <td>{item.kg} kg</td>
                      <td>${item.precioCostoKg?.toFixed(2)}</td>
                      <td style={{color: '#10b981', fontWeight: 'bold'}}>${item.precioTotalCompra?.toFixed(2)}</td>
                      <td>{item.observacion || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngresoMercaderia;
