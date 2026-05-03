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
  acudiente: string;
  telefono: string;
  telefonoAcu: string;
  fotoUrl?: string;
}

export interface GrupoAseo {
  id: string;
  dia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';
  estudianteIds: string[];
  estudiantes?: Estudiante[];
}

export interface MensajeEnviado {
  id: string;
  tipo: 'FELICITACION' | 'DISCIPLINA' | 'CIRCULAR';
  mensaje: string;
  telefono: string;
  fechaEnvio: string;
}


export interface Representante {
  id: string;
  tipo: 'PADRES' | 'ESTUDIANTES';
  nombre: string;
  email: string;
  telefono: string;
}