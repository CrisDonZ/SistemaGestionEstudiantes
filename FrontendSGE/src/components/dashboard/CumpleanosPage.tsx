import { useState, useEffect } from 'react';
import { estudiantesAPI } from '../../utils/api';
import { removeToken } from '../../utils/auth';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  acudiente: string;
}

const MESES = [
  { numero: 1, nombre: 'Enero' },
  { numero: 2, nombre: 'Febrero' },
  { numero: 3, nombre: 'Marzo' },
  { numero: 4, nombre: 'Abril' },
  { numero: 5, nombre: 'Mayo' },
  { numero: 6, nombre: 'Junio' },
  { numero: 7, nombre: 'Julio' },
  { numero: 8, nombre: 'Agosto' },
  { numero: 9, nombre: 'Septiembre' },
  { numero: 10, nombre: 'Octubre' },
  { numero: 11, nombre: 'Noviembre' },
  { numero: 12, nombre: 'Diciembre' }
];

export default function CumpleanosPage() {
  const [todosEstudiantes, setTodosEstudiantes] = useState<Estudiante[]>([]);
  const [cumpleaneros, setCumpleaneros] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  useEffect(() => {
    filtrarCumpleanosPorMes(mesSeleccionado);
  }, [mesSeleccionado, todosEstudiantes]);

  const loadEstudiantes = async () => {
    try {
      setLoading(true);
      const data = await estudiantesAPI.getAll();
      setTodosEstudiantes(data);
    } catch (error: any) {
      console.error('Error cargando estudiantes:', error);
      if (error.message && error.message.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const filtrarCumpleanosPorMes = (mes: number) => {
    const cumpleanosDelMes = todosEstudiantes.filter(estudiante => {
      const mesNacimiento = new Date(estudiante.fechaNacimiento).getMonth() + 1;
      return mesNacimiento === mes;
    });

    // Ordenar por día del mes
    cumpleanosDelMes.sort((a, b) => {
      const diaA = new Date(a.fechaNacimiento).getDate();
      const diaB = new Date(b.fechaNacimiento).getDate();
      return diaA - diaB;
    });

    setCumpleaneros(cumpleanosDelMes);
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  const getNombreMes = (numeroMes: number) => {
    return MESES.find(m => m.numero === numeroMes)?.nombre || '';
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.toLocaleDateString('es-ES', { month: 'long' });
    return `${dia} de ${mes}`;
  };

  const esElMesActual = mesSeleccionado === new Date().getMonth() + 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              ← Volver
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              🎂 Cumpleaños
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selector de Mes */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Selecciona un Mes
              </h2>
              <p className="text-gray-600">
                {cumpleaneros.length} estudiante(s) cumple(n) años en {getNombreMes(mesSeleccionado)}
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                className="w-full sm:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
              >
                {MESES.map((mes) => (
                  <option key={mes.numero} value={mes.numero}>
                    {mes.nombre}
                    {mes.numero === new Date().getMonth() + 1 && ' (Actual)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicador de mes actual */}
          {esElMesActual && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-purple-800 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Estás viendo los cumpleaños del mes actual
              </p>
            </div>
          )}
        </div>

        {/* Lista de Cumpleaños */}
        {cumpleaneros.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎂</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay cumpleaños en {getNombreMes(mesSeleccionado)}
            </h2>
            <p className="text-gray-600">
              No hay estudiantes que cumplan años en este mes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cumpleaneros.map((estudiante) => (
              <div
                key={estudiante.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {estudiante.nombre} {estudiante.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Acudiente: {estudiante.acudiente}
                    </p>
                  </div>
                  <div className="text-4xl">🎉</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {formatearFecha(estudiante.fechaNacimiento)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {esElMesActual 
                        ? `Cumple${calcularEdad(estudiante.fechaNacimiento) + 1} años`
                        : `${calcularEdad(estudiante.fechaNacimiento)} años`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}