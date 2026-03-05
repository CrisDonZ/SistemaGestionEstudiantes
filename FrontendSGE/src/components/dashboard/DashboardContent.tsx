import { useState, useEffect } from 'react';
import { removeToken } from '../../utils/auth';
import { authAPI } from '../../utils/api';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
}

export default function DashboardContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // Solo hacer logout si es error de autenticación
      if (error instanceof Error && error.message.includes('401')) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: 'url("/dashboardImage.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay semi-transparente para mejorar legibilidad */}
      <div className="min-h-screen bg-white bg-opacity-70">
        {/* Header */}
        <header className="bg-white bg-opacity-95 shadow backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🏫 Sistema de Gestión Escolar
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  👤 {user?.nombre || 'Usuario'}
                </span>
              </span>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {user?.nombre || 'Usuario'}
            </h2>
            <p className="text-gray-600">
              Selecciona una opción para comenzar a gestionar la información del colegio
            </p>
          </div>

          {/* Grid de Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card: Estudiantes */}
            <a
              href="/dashboard/estudiantes"
              className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-l-4 border-blue-600 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Estudiantes</h2>
                  <p className="text-gray-600">Gestionar estudiantes y acudientes</p>
                  <span className="text-sm text-blue-600 mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más →
                  </span>
                </div>
              </div>
            </a>

            {/* Card: Grupos de Aseo */}
            <a
              href="/dashboard/grupos-aseo"
              className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-l-4 border-green-600 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Grupos de Aseo</h2>
                  <p className="text-gray-600">Asignar turnos por día</p>
                  <span className="text-sm text-green-600 mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más →
                  </span>
                </div>
              </div>
            </a>

            {/* Card: Cumpleaños */}
            <a
              href="/dashboard/cumpleanos"
              className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-l-4 border-purple-600 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Cumpleaños</h2>
                  <p className="text-gray-600">Ver cumpleaños del mes</p>
                  <span className="text-sm text-purple-600 mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más →
                  </span>
                </div>
              </div>
            </a>

            {/* Card: Representantes */}
            <a
              href="/dashboard/representantes"
              className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-l-4 border-yellow-600 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Representantes</h2>
                  <p className="text-gray-600">Gestionar representantes</p>
                  <span className="text-sm text-yellow-600 mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más →
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Footer info */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Sistema de Gestión Escolar © {new Date().getFullYear()}</p>
          </div>
        </main>
      </div>
    </div>
  );
}