import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//Importar rutas
import authRoutes from './routes/authRoutes';
import grupoRoutes from './routes/grupoRoutes';
import estudianteRoutes from './routes/estudianteRoutes';
import grupoAseoRoutes from './routes/grupoAseoRoutes';


// Cargar variables de entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/grupos-aseo', grupoAseoRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});


//Ruta para listar todos los endpoints disponibles
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
      grupos: {
        getAll: 'GET /api/grupos',
        getById: 'GET /api/grupos/:id',
        create: 'POST /api/grupos',
        update: 'PUT /api/grupos/:id',
        delete: 'DELETE /api/grupos/:id'
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

//Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/api`);
});
