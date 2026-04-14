import React, { forwardRef } from 'react';

// Estilo en linea para el ticket (ancho típico de 80mm es aprox 300px)
const ReceiptTemplate = forwardRef(({ items, total, date }, ref) => {
  return (
    <div ref={ref} style={{ padding: '20px', width: '300px', fontFamily: 'monospace', fontSize: '14px', color: 'black', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>LA CARNICERÍA</h2>
        <p style={{ margin: 0 }}>Ticket no válido como factura</p>
        <p style={{ margin: 0 }}>{date || new Date().toLocaleString()}</p>
        <hr style={{ borderTop: '1px dashed black' }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        {items?.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{item.quantity}kg {item.name}</span>
            <span>${item.price?.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right' }}>
        <hr style={{ borderTop: '1px dashed black' }} />
        <h3>TOTAL: ${total?.toFixed(2)}</h3>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p>¡Gracias por su compra!</p>
      </div>

      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { margin: 1cm; }
        `}
      </style>
    </div>
  );
});

export default ReceiptTemplate;
