import { useState, useEffect } from 'react';
import { removeToken } from '../../utils/auth';
import { authAPI } from '../../utils/api';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function DashboardContent() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error: unknown) {
      console.error('Error cargando perfil:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Gestión Escolar
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              👤 {user?.nombre || 'Cargando...'}
            </span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido al Sistema de Gestión Escolar
          </h2>
          <p className="text-gray-600">
            Selecciona una opción para comenzar a gestionar la información
          </p>
        </div>

        {/* Grid de 5 Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Estudiantes */}
          <a
            href="/dashboard/estudiantes"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border-l-4 border-blue-600"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Estudiantes</h2>
                <p className="text-gray-600">Gestionar información de estudiantes</p>
              </div>
            </div>
          </a>
          
          {/* Card 3: Grupos de Aseo */}
          <a
            href="/dashboard/grupos-aseo"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border-l-4 border-green-600"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Grupos de Aseo</h2>
                <p className="text-gray-600">Organiza grupos de aseo semanales</p>
              </div>
            </div>
          </a>

          {/* Card 4: Cumpleaños */}
          <a
            href="/dashboard/cumpleanos"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border-l-4 border-purple-600"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Cumpleaños</h2>
                <p className="text-gray-600">Ver cumpleaños del mes</p>
              </div>
            </div>
          </a>

          {/* Card 5: Representantes */}
          <a
            href="/dashboard/representantes"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border-l-4 border-yellow-600"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Representantes</h2>
                <p className="text-gray-600">Gestionar representantes</p>
              </div>
            </div>
          </a>

        </div>
      </main>
    </div>
  );
}