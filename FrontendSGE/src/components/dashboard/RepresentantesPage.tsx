import { useState, useEffect } from 'react';
import { representantesAPI } from '../../utils/api';
import { removeToken } from '../../utils/auth';

interface Representante {
  id: string;
  tipo: 'PADRES' | 'ESTUDIANTES';
  nombre: string;
  email: string;
  telefono: string;
}

export default function RepresentantesPage() {
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [filteredRepresentantes, setFilteredRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  const [formData, setFormData] = useState({
    tipo: 'PADRES' as 'PADRES' | 'ESTUDIANTES',
    nombre: '',
    email: '',
    telefono: ''
  });


  // Función para limpiar el número y generar el link
  const getWhatsAppLink = (telefono: string, nombre: string) => {
    // Elimina caracteres no numéricos
    const cleanNumber = telefono.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${nombre}, me comunico desde la institución...`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  useEffect(() => {
    loadRepresentantes();
  }, []);

  useEffect(() => {
    // Aplicar filtro cuando cambie
    if (filtroTipo === 'TODOS') {
      setFilteredRepresentantes(representantes);
    } else {
      setFilteredRepresentantes(
        representantes.filter(r => r.tipo === filtroTipo)
      );
    }
  }, [filtroTipo, representantes]);

  const loadRepresentantes = async () => {
    try {
      setLoading(true);
      const data = await representantesAPI.getAll();
      setRepresentantes(data);
      setFilteredRepresentantes(data);
    } catch (error: any) {
      console.error('Error cargando representantes:', error);
      // Verificar si es error 401 de manera más robusta
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

  const openModal = (representante?: Representante) => {
    if (representante) {
      setEditingId(representante.id);
      setFormData({
        tipo: representante.tipo,
        nombre: representante.nombre,
        email: representante.email,
        telefono: representante.telefono
      });
    } else {
      setEditingId(null);
      setFormData({
        tipo: 'PADRES',
        nombre: '',
        email: '',
        telefono: ''
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

    try {
      if (editingId) {
        await representantesAPI.update(editingId, formData);
      } else {
        await representantesAPI.create(formData);
      }
      await loadRepresentantes();
      closeModal();
    } catch (error: any) {
      setError(error.message || 'Error al guardar representante');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este representante?')) return;

    try {
      await representantesAPI.delete(id);
      await loadRepresentantes();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar representante');
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    return tipo === 'PADRES' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Representantes
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de acciones */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtros */}
          <div className="flex space-x-2" role="tablist" aria-label="Filtros de representantes">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                filtroTipo === 'TODOS'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              aria-selected={filtroTipo === 'TODOS'}
              role="tab"
            >
              Todos <span className="ml-1 text-sm">({representantes.length})</span>
            </button>
            <button
              onClick={() => setFiltroTipo('PADRES')}
              className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                filtroTipo === 'PADRES'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              aria-selected={filtroTipo === 'PADRES'}
              role="tab"
            >
              Padres <span className="ml-1 text-sm">({representantes.filter(r => r.tipo === 'PADRES').length})</span>
            </button>
            <button
              onClick={() => setFiltroTipo('ESTUDIANTES')}
              className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                filtroTipo === 'ESTUDIANTES'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              aria-selected={filtroTipo === 'ESTUDIANTES'}
              role="tab"
            >
              Estudiantes <span className="ml-1 text-sm">({representantes.filter(r => r.tipo === 'ESTUDIANTES').length})</span>
            </button>
          </div>

          {/* Botón Agregar */}
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Agregar Representante
          </button>
        </div>

        {/* Tabla de Representantes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepresentantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay representantes registrados
                  </td>
                </tr>
              ) : (
                filteredRepresentantes.map((representante) => (
                  <tr key={representante.id} className="hover:bg-gray-50">
                    {/* .Columnas */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoBadgeColor(representante.tipo)}`}>
                        {representante.tipo === 'PADRES' ? 'Padres' : 'Estudiantes'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{representante.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{representante.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{representante.telefono}</td>

                    {/* SECCIÓN DE ACCIONES EDITADA */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                      <a
                        href={getWhatsAppLink(representante.telefono, representante.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.036 1.378 4.631 1.379 5.34 0 9.69-4.35 9.693-9.693 0-2.588-1.007-5.023-2.835-6.85-1.828-1.827-4.266-2.834-6.853-2.834-5.347 0-9.691 4.341-9.693 9.684-.001 1.7.443 3.354 1.288 4.8l-.995 3.637 3.759-.986zM17.467 14.37c-.3-.15-1.771-.874-2.043-.974-.275-.099-.474-.15-.675.15-.2.3-.775 1.012-.95 1.213-.175.201-.35.225-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.3-.349.45-.525.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.52l-.575-.011c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.125 4.527.715.308 1.273.491 1.708.629.716.228 1.368.196 1.883.118.574-.088 1.771-.724 2.022-1.424.249-.699.249-1.299.174-1.424-.075-.125-.275-.2-.575-.35z"/>
                        </svg>
                      </a>

                      <button
                        onClick={() => openModal(representante)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(representante.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 id="modal-title" className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Representante' : 'Agregar Representante'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Representante
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PADRES' | 'ESTUDIANTES' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="PADRES">Padres</option>
                  <option value="ESTUDIANTES">Estudiantes</option>
                </select>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: María González"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  placeholder="3001234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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