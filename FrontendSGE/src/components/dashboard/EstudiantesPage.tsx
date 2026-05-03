import { useState, useEffect } from 'react';
import { estudiantesAPI } from '../../utils/api';
import { removeToken } from '../../utils/auth';
import DetalleEstudianteModal from './DetalleEstudianteModal';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  acudiente: string;
  telefono: string;
  telefonoAcu: string;
  fotoUrl?: string;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [previewFoto, setPreviewFoto] = useState<string>('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    acudiente: '',
    telefono: '',
    telefonoAcu: '',
    fotoUrl: ''
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
        acudiente: estudiante.acudiente,
        telefono: estudiante.telefono,
        telefonoAcu: estudiante.telefonoAcu,
        fotoUrl: estudiante.fotoUrl || ''
      });
      setPreviewFoto(estudiante.fotoUrl || '');
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        acudiente: '',
        telefono: '',
        telefonoAcu: '',
        fotoUrl: ''
      });
      setPreviewFoto('');
    }
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError('');
    setPreviewFoto('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen debe ser menor a 2MB');
        return;
      }

      // Convertir a base64 para preview y guardar
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewFoto(base64String);
        setFormData({ ...formData, fotoUrl: base64String });
      };
      reader.onerror = () => {
        setError('Error al leer la imagen');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) return 'El nombre es requerido';
    if (!formData.apellido.trim()) return 'El apellido es requerido';
    if (!formData.fechaNacimiento) return 'La fecha de nacimiento es requerida';
    if (!formData.acudiente.trim()) return 'El nombre del acudiente es requerido';
    if (!formData.telefono.trim()) return 'El teléfono del estudiante es requerido';
    if (!formData.telefonoAcu.trim()) return 'El teléfono del acudiente es requerido';
    
    // Validar formato de teléfono (solo números)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(formData.telefono.replace(/\D/g, ''))) {
      return 'El teléfono del estudiante debe contener solo números (7-15 dígitos)';
    }
    if (!phoneRegex.test(formData.telefonoAcu.replace(/\D/g, ''))) {
      return 'El teléfono del acudiente debe contener solo números (7-15 dígitos)';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

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

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
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

  const formatearTelefono = (telefono: string) => {
    // Formatear número de teléfono (ej: 3001234567 -> 300 123 4567)
    const cleaned = telefono.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return telefono;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando estudiantes...</div>
        </div>
      </div>
    );
  }

  const handleVerDetalle = (estudiante: Estudiante) => {
  setEstudianteSeleccionado(estudiante);
    setShowDetalleModal(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetalleModal(false);
    setEstudianteSeleccionado(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Estudiantes
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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

        {/* Grid de Tarjetas */}
        {estudiantes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estudiantes.map((estudiante) => (
              <div
                key={estudiante.id}
                onClick={() => handleVerDetalle(estudiante)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 cursor-pointer"
              >
                {/* Foto/Avatar */}
                <div className="flex items-center space-x-4 mb-4">
                  {estudiante.fotoUrl ? (
                    <img
                      src={estudiante.fotoUrl}
                      alt={`${estudiante.nombre} ${estudiante.apellido}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      onError={(e) => {
                        // Si la imagen falla, mostrar avatar con iniciales
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold ${estudiante.fotoUrl ? 'hidden' : ''} avatar-fallback`}>
                    {getInitials(estudiante.nombre, estudiante.apellido)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {estudiante.nombre} {estudiante.apellido}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatearFecha(estudiante.fechaNacimiento)}
                    </p>
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Acudiente:</span>
                    <span className="ml-1 truncate">{estudiante.acudiente}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">Tel. Estudiante:</span>
                    <span className="ml-1">{formatearTelefono(estudiante.telefono)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">Tel. Acudiente:</span>
                    <span className="ml-1">{formatearTelefono(estudiante.telefonoAcu)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(estudiante);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(estudiante.id);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-2xl w-full my-8 shadow-2xl">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del Estudiante <span className="text-gray-400">(Opcional)</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-shrink-0">
                    {previewFoto ? (
                      <img
                        src={previewFoto}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG o GIF. Máximo 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
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

                {/* Apellido */}
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
              </div>

              {/* Fecha de Nacimiento */}
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
              </div>

              {/* Acudiente */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teléfono Estudiante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Estudiante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="3001234567"
                    maxLength={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Teléfono Acudiente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Acudiente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoAcu}
                    onChange={(e) => setFormData({ ...formData, telefonoAcu: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="3009876543"
                    maxLength={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition font-semibold"
                >
                  {editingId ? 'Actualizar Estudiante' : 'Crear Estudiante'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetalleModal && estudianteSeleccionado && (
        <DetalleEstudianteModal
          estudiante={estudianteSeleccionado}
          onClose={handleCerrarDetalle}
        />
      )}
    </div>
  );
}