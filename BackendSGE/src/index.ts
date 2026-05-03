import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Importar rutas
import authRoutes from './routes/authRoutes';
import estudianteRoutes from './routes/estudianteRoutes';
import grupoAseoRoutes from './routes/grupoAseoRoutes';
import representanteRoutes from './routes/representanteRoutes';
import mensajeRoutes from './routes/mensajeRoutes';


const app = express();
const PORT = process.env.PORT || 4000;

// ===== MIDDLEWARES GLOBALES (ORDEN IMPORTANTÍSIMO) =====

// 1. CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body parsers - CRÍTICO: Debe estar ANTES de las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging (para debugging)
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// ===== RUTAS =====
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/grupos-aseo', grupoAseoRoutes);
app.use('/api/representantes', representanteRoutes);
app.use('/api/mensajes', mensajeRoutes);




// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para documentación
app.get('/api', (req, res) => {
  res.json({
    message: 'Sistema de Gestión Escolar API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      estudiantes: {
        getAll: 'GET /api/estudiantes',
        getById: 'GET /api/estudiantes/:id',
        create: 'POST /api/estudiantes',
        update: 'PUT /api/estudiantes/:id',
        delete: 'DELETE /api/estudiantes/:id',
        cumpleanos: 'GET /api/estudiantes/cumpleanos'
      },
      gruposAseo: {
        getAll: 'GET /api/grupos-aseo',
        getByDia: 'GET /api/grupos-aseo/dia/:dia',
        createOrUpdate: 'POST /api/grupos-aseo',
        delete: 'DELETE /api/grupos-aseo/:id'
      },
      representantes: {
        getAll: 'GET /api/representantes',
        getByTipo: 'GET /api/representantes/tipo/:tipo',
        getById: 'GET /api/representantes/:id',
        create: 'POST /api/representantes',
        update: 'PUT /api/representantes/:id',
        delete: 'DELETE /api/representantes/:id'
      }
    }
  });
});

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación en http://localhost:${PORT}/api`);
  console.log(`✅ CORS habilitado para: http://localhost:3000\n`);
});