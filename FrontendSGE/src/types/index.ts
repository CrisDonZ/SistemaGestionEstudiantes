export interface Usuario {
    id: string;
    nombre: string;
    email: string;
}

export interface Estudiante {
    id: string;
    nombre: string;
    apellido: string;
    grado: string;
    fechaNacimiento: Date;
    grupoId: string;
}

export interface Grupo{
    id: string;
    nombre: string;
    grado: string;
    estudiantes?: Estudiante[];
}

export interface GrupoAseo{
    id: string;
    dia: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES";
    estudianteIds: string[];
    estudiantes?: Estudiante[];
}

export interface Representante{
    id: string;
    tipo: 'PADRES_FAMILIA' | 'ESTUDIANTES';
    nombre: string;
    email: string;
    telefono: string;
}