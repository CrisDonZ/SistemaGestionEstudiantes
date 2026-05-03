import { useState, useEffect } from 'react';
import { materiasAPI, mensajesAPI } from '../../utils/api';

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

interface Props {
  estudiante: Estudiante;
  onClose: () => void;
}

interface ResumenAcademico {
  totalMaterias: number;
  promedioGeneral: number;
  materiasDestacadas: { nombre: string; calificacion: number }[];
  materiasEnRiesgo: { nombre: string; calificacion: number }[];
}

export default function DetalleEstudianteModal({ estudiante, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'academico' | 'mensajes'>('info');
  const [resumen, setResumen] = useState<ResumenAcademico | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [showMensajeModal, setShowMensajeModal] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState<'FELICITACION' | 'DISCIPLINA'>('FELICITACION');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [loadingMensaje, setLoadingMensaje] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);

  useEffect(() => {
    if (activeTab === 'academico') {
      loadResumenAcademico();
    }
  }, [activeTab]);

  const loadResumenAcademico = async () => {
    try {
      setLoadingResumen(true);
      const data = await materiasAPI.getResumen(estudiante.id);
      setResumen(data);
    } catch (error) {
      console.error('Error cargando resumen:', error);
    } finally {
      setLoadingResumen(false);
    }
  };
  const handleOpenMensaje = (tipo: 'FELICITACION' | 'DISCIPLINA') => {
    setTipoMensaje(tipo);
    
    // Mensaje predefinido
    if (tipo === 'FELICITACION') {
      const mensajePredefinido = `¡Hola ${estudiante.nombre}! 🎉\n\nFelicitaciones por tu excelente desempeño. ¡Sigue así!\n\nSaludos,\nTu profesor(a)`;
      setMensajeTexto(mensajePredefinido);
    } else {
      // Para disciplina, dirigirse al acudiente
      const mensajePredefinido = `Estimado(a) ${estudiante.acudiente},\n\nLe informamos que necesitamos conversar sobre el comportamiento de ${estudiante.nombre} en clase. Por favor, es importante que reforcemos juntos los valores de respeto y disciplina.\n\nAgradecemos su atención.\n\nSaludos,\nTu profesor(a)`;
      setMensajeTexto(mensajePredefinido);
    }
    
    setShowMensajeModal(true);
  };

  const handleEnviarMensaje = async () => {
    try {
      setLoadingMensaje(true);
      
      // Determinar el teléfono según el tipo de mensaje
      const telefono = tipoMensaje === 'DISCIPLINA' 
        ? estudiante.telefonoAcu 
        : estudiante.telefono;
      
      const response = await mensajesAPI.enviar({
        tipo: tipoMensaje,
        mensaje: mensajeTexto,
        estudianteId: estudiante.id,
        telefono: telefono
      });

      // Abrir WhatsApp Web
      window.open(response.whatsappUrl, '_blank');
      
      setShowMensajeModal(false);
      
      // Mostrar mensaje de confirmación con destinatario
      const destinatario = tipoMensaje === 'DISCIPLINA' 
        ? `${estudiante.acudiente} (${estudiante.telefonoAcu})`
        : `${estudiante.nombre} (${estudiante.telefono})`;
      
      alert(`Mensaje preparado para: ${destinatario}\nSe abrirá WhatsApp Web.`);
    } catch (error: any) {
      alert(error.message || 'Error al enviar mensaje');
    } finally {
      setLoadingMensaje(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Saltar header
      const dataLines = lines.slice(1);
      
      const materias = dataLines.map(line => {
        const [nombre, calificacion, periodo] = line.split(',').map(s => s.trim());
        return {
          nombre,
          calificacion: parseFloat(calificacion),
          periodo: periodo || 'Periodo Actual'
        };
      });

      await materiasAPI.importarCSV(estudiante.id, materias);
      alert('Materias importadas exitosamente');
      loadResumenAcademico();
      setShowImportCSV(false);
    } catch (error: any) {
      alert('Error al importar CSV: ' + error.message);
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-4xl w-full my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {estudiante.fotoUrl ? (
                  <img
                    src={estudiante.fotoUrl}
                    alt={`${estudiante.nombre} ${estudiante.apellido}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white">
                    {getInitials(estudiante.nombre, estudiante.apellido)}
                  </div>
                )}
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {estudiante.nombre} {estudiante.apellido}
                  </h2>
                  <p className="text-blue-100">
                    {calcularEdad(estudiante.fechaNacimiento)} años
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab('academico')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'academico'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Estado Académico
              </button>
              <button
                onClick={() => setActiveTab('mensajes')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'mensajes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Acciones
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Tab: Información */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de Nacimiento</p>
                    <p className="font-semibold">
                      {new Date(estudiante.fechaNacimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Acudiente</p>
                    <p className="font-semibold">{estudiante.acudiente}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tel. Estudiante</p>
                    <p className="font-semibold">{estudiante.telefono}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tel. Acudiente</p>
                    <p className="font-semibold">{estudiante.telefonoAcu}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Estado Académico */}
            {activeTab === 'academico' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Resumen Académico</h3>
                  <button
                    onClick={() => setShowImportCSV(!showImportCSV)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    {showImportCSV ? 'Cancelar' : 'Importar CSV'}
                  </button>
                </div>

                {showImportCSV && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Formato CSV:</strong> nombre,calificacion,periodo
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      Ejemplo: Matemáticas,4.5,Primer Periodo
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {loadingResumen ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando resumen...</p>
                  </div>
                ) : resumen ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {resumen.totalMaterias}
                        </p>
                        <p className="text-sm text-gray-600">Materias</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {resumen.promedioGeneral.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Promedio</p>
                      </div>
                    </div>

                    {resumen.materiasDestacadas.length > 0 && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-bold text-green-800 mb-2">
                           Materias Destacadas (≥ 4.5)
                        </h4>
                        <ul className="space-y-1">
                          {resumen.materiasDestacadas.map((m, i) => (
                            <li key={i} className="text-sm text-green-700">
                              • {m.nombre}: <strong>{m.calificacion}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resumen.materiasEnRiesgo.length > 0 && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 className="font-bold text-red-800 mb-2">
                           Materias en Riesgo (&lt; 3.0)
                        </h4>
                        <ul className="space-y-1">
                          {resumen.materiasEnRiesgo.map((m, i) => (
                            <li key={i} className="text-sm text-red-700">
                              • {m.nombre}: <strong>{m.calificacion}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay materias registradas</p>
                    <p className="text-sm mt-2">Importa un archivo CSV para comenzar</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Acciones/Mensajes */}
            {activeTab === 'mensajes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleOpenMensaje('FELICITACION')}
                    className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition text-left"
                  >
                    <div className="flex items-center space-x-3">
                      
                      <div>
                        <h4 className="font-bold text-lg">Felicitación</h4>
                        <p className="text-sm text-green-100">Enviar mensaje de felicitación</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleOpenMensaje('DISCIPLINA')}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg transition text-left"
                  >
                    <div className="flex items-center space-x-3">
                      
                      <div>
                        <h4 className="font-bold text-lg">Disciplina</h4>
                        <p className="text-sm text-orange-100">Enviar llamado de atención</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> Los mensajes se enviarán a través de WhatsApp Web al número:{' '}
                    <span className="font-semibold">{estudiante.telefono}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
            
          </div>
        </div>
      </div>

      {/* Modal de Mensaje */}
      {showMensajeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">
              {tipoMensaje === 'FELICITACION' ? '🎉 Mensaje de Felicitación' : '⚠️ Llamado de Atención'}
            </h3>

            {/* AGREGAR ESTE BLOQUE */}
            <div className={`p-3 rounded-lg mb-4 ${
              tipoMensaje === 'FELICITACION' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
            }`}>
              <p className="text-sm font-medium mb-1">
                Se enviará a:
              </p>
              <p className="text-sm">
                {tipoMensaje === 'FELICITACION' ? (
                  <>
                    <strong>{estudiante.nombre} {estudiante.apellido}</strong>
                    <br />
                    <span className="text-gray-600">{estudiante.telefono}</span>
                  </>
                ) : (
                  <>
                    <strong>{estudiante.acudiente}</strong> (Acudiente)
                    <br />
                    <span className="text-gray-600">{estudiante.telefonoAcu}</span>
                  </>
                )}
              </p>
            </div>

            <textarea
              value={mensajeTexto}
              onChange={(e) => setMensajeTexto(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Escribe tu mensaje aquí..."
            />

            <div className="flex space-x-3">
              <button
                onClick={handleEnviarMensaje}
                disabled={loadingMensaje}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:bg-gray-400"
              >
                {loadingMensaje ? 'Enviando...' : 'Enviar por WhatsApp'}
              </button>
              <button
                onClick={() => setShowMensajeModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

        </>
  );
}