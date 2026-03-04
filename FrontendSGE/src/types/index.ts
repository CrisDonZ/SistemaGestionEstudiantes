export interface User {
  id: string;
  email: string;
  nombre: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  acudiente: string; // NUEVO CAMPO
}

export interface GrupoAseo {
  id: string;
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';
  estudianteIds: string[];
  estudiantes?: Estudiante[];
}

export interface Representante {
  id: string;
  tipo: 'PADRES' | 'ESTUDIANTES';
  nombre: string;
  email: string;
  telefono: string;
}