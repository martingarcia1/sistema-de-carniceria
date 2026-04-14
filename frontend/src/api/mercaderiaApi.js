import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getProductos = () => api.get('/mercaderia/productos');
export const crearProducto = (data) => api.post('/mercaderia/productos', data);
export const getIngresos = (params) => api.get('/mercaderia/ingresos', { params });
export const registrarIngreso = (data) => api.post('/mercaderia/ingresos', data);
