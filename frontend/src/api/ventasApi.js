import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getVentas = (params) => api.get('/ventas', { params });
export const registrarVenta = (data) => api.post('/ventas', data);
export const imprimirRecibo = (id) => api.post(`/ventas/${id}/recibo`);
export const getRecibo = (id) => api.get(`/ventas/${id}/recibo`);
