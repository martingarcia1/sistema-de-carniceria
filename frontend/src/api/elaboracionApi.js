import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getElaboraciones = (params) => api.get('/elaboracion', { params });
export const registrarElaboracion = (data) => api.post('/elaboracion', data);
export const getRecetas = () => api.get('/elaboracion/recetas');
export const guardarReceta = (data) => api.post('/elaboracion/recetas', data);
