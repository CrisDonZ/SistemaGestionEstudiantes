import { useState, useEffect } from 'react';
import { estudiantesAPI } from '../../utils/api';
import { removeToken } from '../../utils/auth';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  acudiente: string;
  grupo?: {
    id: string;
    nombre: string;
    grado: string;
  } | null;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    acudiente: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const estudiantesData = await estudiantesAPI.getAll();
      setEstudiantes(estudiantesData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      // Verificar si es error de autenticación
      if (error.message?.includes('401') || error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  const openModal = (estudiante?: Estudiante) => {
    if (estudiante) {
      setEditingId(estudiante.id);
      setFormData({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fechaNacimiento: estudiante.fechaNacimiento.split('T')[0],
        acudiente: estudiante.acudiente
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        acudiente: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.fechaNacimiento || !formData.acudiente.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      if (editingId) {
        await estudiantesAPI.update(editingId, formData);
      } else {
        await estudiantesAPI.create(formData);
      }
      await loadData();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      // Extraer mensaje de error de la respuesta del servidor
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar estudiante';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      await estudiantesAPI.delete(id);
      await loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar estudiante';
      alert(errorMessage);
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando estudiantes...</div>
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
              ← Volver al Dashboard
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              👥 Gestión de Estudiantes
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
        {/* Botón Agregar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
            <p className="text-gray-600">
              Total de estudiantes: <span className="font-bold text-2xl text-blue-600 ml-2">{estudiantes.length}</span>
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Estudiante
          </button>
        </div>

        {/* Tabla de Estudiantes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {estudiantes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay estudiantes registrados</h3>
              <p className="text-gray-600 mb-6">Comienza agregando tu primer estudiante</p>
              <button
                onClick={() => openModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Estudiante
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Nacimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acudiente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatearFecha(estudiante.fechaNacimiento)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {estudiante.acudiente}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {estudiante.grupo ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {estudiante.grupo.nombre} ({estudiante.grupo.grado})
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Sin grupo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(estudiante)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(estudiante.id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  placeholder="Ej: Pérez"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El estudiante debe tener al menos 1 año de edad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Acudiente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.acudiente}
                  onChange={(e) => setFormData({ ...formData, acudiente: e.target.value })}
                  required
                  placeholder="Ej: María González"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  {editingId ? 'Actualizar Estudiante' : 'Crear Estudiante'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
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