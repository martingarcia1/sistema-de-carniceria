import React, { useState, useEffect } from 'react';
import './IngresoMercaderia.css';
import { toast } from 'react-hot-toast';

const IngresoMercaderia = () => {
  const [activeTab, setActiveTab] = useState('registrar'); // 'registrar' | 'historial'
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalanza, setLoadingBalanza] = useState(false);

  // Historial
  const [historial, setHistorial] = useState([]);

  // Modos de registro
  const [modoIngreso, setModoIngreso] = useState('pieza_entera'); // 'pieza_entera' | 'corte'

  // Modal para nuevo producto integrado
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const [formData, setFormData] = useState({
    productoId: '',
    kg: '',
    precioTotalCompra: '',
    precioCostoKg: '', 
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

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/mercaderia/productos');
      if (res.ok) {
        const data = await res.json();
        // Solo materia prima o todos; la API devuelve todos.
        setProductos(data);
      }
    } catch {
      toast.error('Error al cargar la lista de productos');
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/mercaderia/ingresos');
      if (res.ok) {
        setHistorial(await res.json());
      }
    } catch {
      toast.error('Error al cargar historial');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si detectamos que seleccionó "nuevo", abrimos el modo de creación de producto
    if (name === 'productoId' && value === 'nuevo') {
      setShowNewProduct(true);
      setFormData(prev => ({ ...prev, productoId: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;
    try {
      const res = await fetch('/api/mercaderia/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newProductName, tipo: 1 }) // Tipo 1 = MateriaPrima
      });
      if (res.ok) {
        const newProd = await res.json();
        setProductos(prev => [...prev, newProd]);
        setFormData(prev => ({ ...prev, productoId: newProd.id }));
        setShowNewProduct(false);
        setNewProductName('');
        toast.success(`Producto "${newProd.nombre}" creado exitosamente`);
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

  const cancelNewProduct = () => {
    setShowNewProduct(false);
    setNewProductName('');
    setFormData(prev => ({ ...prev, productoId: '' }));
  };

  // Cálculos dinámicos
  const getCostoPorKgEstimado = () => {
    const kg = Number(formData.kg) || 0;
    if (modoIngreso === 'pieza_entera') {
      const total = Number(formData.precioTotalCompra) || 0;
      return (kg > 0 && total > 0) ? (total / kg).toFixed(2) : '0.00';
    } else {
      return Number(formData.precioCostoKg || 0).toFixed(2);
    }
  };

  const getPrecioTotalEstimado = () => {
    const kg = Number(formData.kg) || 0;
    if (modoIngreso === 'pieza_entera') {
      return Number(formData.precioTotalCompra || 0).toFixed(2);
    } else {
      const costoKg = Number(formData.precioCostoKg) || 0;
      return (kg * costoKg).toFixed(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productoId || !formData.kg) {
      toast.error('Seleccione un producto y especifique la cantidad');
      return;
    }

    const kgVal = parseFloat(formData.kg);
    let totalCompraVal = 0;

    if (modoIngreso === 'pieza_entera') {
      if (!formData.precioTotalCompra) return toast.error('Especifique el costo total de la pieza');
      totalCompraVal = parseFloat(formData.precioTotalCompra);
    } else {
      if (!formData.precioCostoKg) return toast.error('Especifique el costo por Kg');
      totalCompraVal = kgVal * parseFloat(formData.precioCostoKg);
    }

    setLoading(true);
    const dto = {
      productoId: parseInt(formData.productoId),
      kg: kgVal,
      precioTotalCompra: totalCompraVal,
      observacion: formData.observacion
    };

    try {
      const response = await fetch('/api/mercaderia/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (response.ok) {
        toast.success('Ingreso registrado en el inventario');
        setFormData({ productoId: '', kg: '', precioTotalCompra: '', precioCostoKg: '', observacion: '' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error del servidor');
      }
    } catch {
      toast.error('Error de red al procesar ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ingreso-container">
      <div className="ingreso-header">
        <h1>Centro de Recepción</h1>
        <p>Registre ingresos de materia prima, cortes y actualización de stock</p>
      </div>

      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'registrar' ? 'active' : ''}`} onClick={() => setActiveTab('registrar')}>
          Registrar Ingreso
        </button>
        <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
          Historial de Ingresos
        </button>
      </div>

      {activeTab === 'registrar' && (
        <div className="animate-fade-in">
          
          <div className="ingreso-mode-toggle">
            <button 
              type="button" 
              className={`mode-btn ${modoIngreso === 'pieza_entera' ? 'active' : ''}`}
              onClick={() => { setModoIngreso('pieza_entera'); setFormData(p => ({...p, precioCostoKg: ''})); }}
            >
              🥩 Media Res / Pieza Entera
            </button>
            <button 
              type="button" 
              className={`mode-btn ${modoIngreso === 'corte' ? 'active' : ''}`}
              onClick={() => { setModoIngreso('corte'); setFormData(p => ({...p, precioTotalCompra: ''})); }}
            >
              🔪 Corte específico / Insumo
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            
            <div className="form-row">
              <div className="form-group">
                <label>Seleccionar Producto</label>
                {!showNewProduct ? (
                  <select 
                    name="productoId" 
                    className="form-control"
                    value={formData.productoId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Elija un producto del catálogo --</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stockKg} kg)</option>)}
                    <option value="nuevo" style={{fontWeight: 'bold', color: '#ff8a00'}}>+ Añadir y Crear Nuevo Producto</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nombre del nuevo producto..."
                      value={newProductName}
                      onChange={e => setNewProductName(e.target.value)}
                      autoFocus
                    />
                    <button type="button" onClick={handleCreateProduct} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>Guardar</button>
                    <button type="button" onClick={cancelNewProduct} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>X</button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>PESO (Llevar producto a la balanza)</label>
              <div className="scale-integration">
                <div className="scale-input-wrapper">
                  <input 
                    type="number" 
                    name="kg" 
                    step="0.001" 
                    className="form-control" 
                    placeholder="0.000"
                    value={formData.kg}
                    onChange={handleInputChange}
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                    required
                  />
                  <span className="unit">KG</span>
                </div>
                <button type="button" className="btn-scale" onClick={leerBalanza} disabled={loadingBalanza}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="14" width="18" height="8" rx="2"/><path d="M12 14v-4"/><path d="M8 8h8l1-4H7l1 4z"/></svg>
                  {loadingBalanza ? 'Leyendo serial...' : 'Pesar en Balanza'}
                </button>
              </div>
            </div>

            <div className="form-row">
              {modoIngreso === 'pieza_entera' ? (
                <div className="form-group animate-fade-in">
                  <label>Monto Facturado/Pagado (por toda la pieza)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0a0a0' }}>$</span>
                    <input style={{ paddingLeft: '35px' }} type="number" name="precioTotalCompra" step="0.01" className="form-control" placeholder="0.00" value={formData.precioTotalCompra} onChange={handleInputChange} required />
                  </div>
                </div>
              ) : (
                <div className="form-group animate-fade-in">
                  <label>Costo pagado por KG (Proveedor)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0a0a0' }}>$</span>
                    <input style={{ paddingLeft: '35px' }} type="number" name="precioCostoKg" step="0.01" className="form-control" placeholder="0.00" value={formData.precioCostoKg} onChange={handleInputChange} required />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Observaciones (Lote, Proveedor, Remito)</label>
              <input type="text" name="observacion" className="form-control" placeholder="Opcional..." value={formData.observacion} onChange={handleInputChange} />
            </div>

            <div className="summary-card">
              <div className="summary-row">
                <span>Rendimiento Base (Costo/Kg)</span>
                <span>${getCostoPorKgEstimado()} / kg</span>
              </div>
              <div className="summary-total">
                <span>IMPORTE TOTAL (Compra)</span>
                <span>${getPrecioTotalEstimado()}</span>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading || showNewProduct}>
              {loading ? 'Impactando en BD...' : 'CONFIRMAR INGRESO AL STOCK'}
            </button>
          </form>
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
                {historial.length === 0 ? (
                  <tr><td colSpan="7" style={{textAlign:'center', color: '#a0a0a0'}}>No hay ingresos recientes registrados</td></tr>
                ) : (
                  historial.map((item, idx) => (
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
