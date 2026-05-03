import { getToken } from './auth';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api';

// Función helper para hacer peticiones
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log('🔵 Enviando petición:', {
    url: `${API_URL}${endpoint}`,
    method: options.method || 'GET',
    headers,
    body: options.body
  });

  const response = await fetch(`${API_URL}${endpoint}`, config);

  console.log('🔵 Respuesta recibida:', {
    status: response.status,
    ok: response.ok
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  return response.json();
};

// API de Autenticación
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, password: string, nombre: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre }),
    }),
  
  getProfile: () => fetchAPI('/auth/profile'),
};

// API de Estudiantes
export const estudiantesAPI = {
  getAll: () => fetchAPI('/estudiantes'),
  getById: (id: string) => fetchAPI(`/estudiantes/${id}`),
  create: (data: any) => fetchAPI('/estudiantes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/estudiantes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/estudiantes/${id}`, {
    method: 'DELETE',
  }),
  getCumpleanos: () => fetchAPI('/estudiantes/cumpleanos'),
};


// API de Grupos de Aseo
export const gruposAseoAPI = {
  getAll: () => fetchAPI('/grupos-aseo'),
  getByDia: (dia: string) => fetchAPI(`/grupos-aseo/dia/${dia}`),
  createOrUpdate: (data: any) => fetchAPI('/grupos-aseo', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/grupos-aseo/${id}`, {
    method: 'DELETE',
  }),
};

// API de Representantes
export const representantesAPI = {
  getAll: () => fetchAPI('/representantes'),
  getByTipo: (tipo: string) => fetchAPI(`/representantes/tipo/${tipo}`),
  getById: (id: string) => fetchAPI(`/representantes/${id}`),
  create: (data: any) => fetchAPI('/representantes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/representantes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/representantes/${id}`, {
    method: 'DELETE',
  }),
};

// API de Materias
export const materiasAPI = {
  getByEstudiante: (estudianteId: string) => fetchAPI(`/materias/estudiante/${estudianteId}`),
  getResumen: (estudianteId: string) => fetchAPI(`/materias/resumen/${estudianteId}`),
  importarCSV: (estudianteId: string, materias: any[]) => fetchAPI('/materias/importar', {
    method: 'POST',
    body: JSON.stringify({ estudianteId, materias }),
  }),
};

// API de Mensajes
export const mensajesAPI = {
  enviar: (data: any) => fetchAPI('/mensajes/enviar', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  enviarCircular: (mensaje: string, estudianteIds: string[]) => fetchAPI('/mensajes/circular', {
    method: 'POST',
    body: JSON.stringify({ mensaje, estudianteIds }),
  }),
  getHistorial: (estudianteId: string) => fetchAPI(`/mensajes/historial/${estudianteId}`),
};