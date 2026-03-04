import { useState, useEffect } from 'react';
import { gruposAseoAPI, estudiantesAPI } from '../../utils/api';
import { removeToken } from '../../utils/auth';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
}

interface GrupoAseo {
  id: string;
  dia: string;
  estudiantes: Estudiante[];
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

export default function GruposAseoPage() {
  const [gruposAseo, setGruposAseo] = useState<GrupoAseo[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gruposData, estudiantesData] = await Promise.all([
        gruposAseoAPI.getAll(),
        estudiantesAPI.getAll()
      ]);
      setGruposAseo(gruposData);
      setEstudiantes(estudiantesData);
    } catch (error: unknown) {
      console.error('Error cargando datos:', error);
      // Verificar si el error es un objeto con mensaje
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (errorMessage.includes('401')) {
          handleLogout();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  const openModal = (dia: string) => {
    const grupoExistente = gruposAseo.find(g => g.dia === dia);
    setSelectedDia(dia);
    setSelectedEstudiantes(
      grupoExistente ? grupoExistente.estudiantes.map(e => e.id) : []
    );
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDia('');
    setSelectedEstudiantes([]);
    setError('');
  };

  const toggleEstudiante = (estudianteId: string) => {
    setSelectedEstudiantes(prev => {
      if (prev.includes(estudianteId)) {
        return prev.filter(id => id !== estudianteId);
      } else {
        return [...prev, estudianteId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await gruposAseoAPI.createOrUpdate({
        dia: selectedDia,
        estudianteIds: selectedEstudiantes
      });
      await loadData();
      closeModal();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        setError(String(error.message) || 'Error al guardar grupo de aseo');
      } else {
        setError('Error al guardar grupo de aseo');
      }
    }
  };

  const getGrupoByDia = (dia: string) => {
    return gruposAseo.find(g => g.dia === dia);
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 transition font-medium"
              >
                ← Volver al Dashboard
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Grupos de Aseo por Día
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIAS.map((dia) => {
            const grupo = getGrupoByDia(dia);
            return (
              <div key={dia} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{dia}</h3>
                  <button
                    onClick={() => openModal(dia)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Asignar
                  </button>
                </div>

                <div className="space-y-2">
                  {grupo && grupo.estudiantes.length > 0 ? (
                    grupo.estudiantes.map((estudiante) => (
                      <div
                        key={estudiante.id}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {estudiante.nombre} {estudiante.apellido}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No hay estudiantes asignados
                    </p>
                  )}
                </div>

                {grupo && grupo.estudiantes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-4">
                    Total: {grupo.estudiantes.length} estudiante(s)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Asignar Estudiantes - {selectedDia}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona los estudiantes que realizarán aseo este día:
                </p>

                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {estudiantes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay estudiantes disponibles
                    </p>
                  ) : (
                    estudiantes.map((estudiante) => (
                      <label
                        key={estudiante.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEstudiantes.includes(estudiante.id)}
                          onChange={() => toggleEstudiante(estudiante.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-900">
                          {estudiante.nombre} {estudiante.apellido}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Seleccionados: {selectedEstudiantes.length}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  Guardar Asignación
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}