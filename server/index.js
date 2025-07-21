import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
//import connectDB from './database/db.js';
import authRoutes from './routes/auth.js';
import roomsRoutes from './routes/rooms.js';
import messagesRoutes from './routes/messages.js';
import { authenticateSocket } from './middleware/auth.js';
import { handleSocketConnection } from './socket/socketHandlers.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = createServer(app);

// Dynamic CORS origin function to handle webcontainer environments
const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  // Production CORS origins
  const allowedOrigins = [
    'https://localhost:5173',
    'https://127.0.0.1:5173',
    // Add your frontend domain here
    // 'https://your-frontend-domain.com'
  ];
  
  // Check against allowed origins
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Allow localhost for development
  if (origin.includes('localhost:5173') || origin.includes('127.0.0.1:5173')) {
    return callback(null, true);
  }
  
  // Allow webcontainer URLs
  if (origin.includes('.webcontainer-api.io') || origin.includes('.stackblitz.io')) {
    return callback(null, true);
  }
  
  // Allow Render, Vercel, Netlify domains
  if (origin.includes('.render.com') || origin.includes('.vercel.app') || origin.includes('.netlify.app')) {
    return callback(null, true);
  }
  
  // Allow the configured client origin if set
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (clientOrigin && origin === clientOrigin) {
    return callback(null, true);
  }
  
  // Reject other origins
  callback(new Error('Not allowed by CORS'));
};

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'Checking...'
  });
});

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aklive-chat';

// db connection
const connectDB = async () => {
  try {
    console.log('🔄 Tentative de connexion à MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, 
      // {
      //   // useNewUrlParser: true,
      //   // useUnifiedTopology: true,
      // }
  );

    console.log(`✅ MongoDB connecté: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    // Afficher la version de MongoDB
    const dbVersion = await mongoose.connection.db.command({ buildInfo: 1 });
    console.log(`📦 Version de MongoDB: ${dbVersion.version}`);
    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB déconnecté');
    });

    // Gestion de l'arrêt propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    
    // En cas d'erreur, on continue avec des données mock
    console.log('⚠️ Fonctionnement en mode mock sans base de données');
    
    // Ne pas arrêter le serveur, continuer avec les endpoints mock
    return false;
  }
};


// Fonction pour démarrer le serveur avec les bonnes routes
async function startServer() {
  try {
    console.log('🔄 Starting server...');
    
    // Essayer de se connecter à la base de données, mais ne pas bloquer le serveur
    let isDBConnected = false;
    try {
      isDBConnected = await connectDB();
    } catch (dbError) {
      console.log('⚠️  Database not available, using mock mode');
      isDBConnected = false;
    }
    
    if (isDBConnected) {
      console.log('✅ Database connected - Using MongoDB routes');
      
      // Routes avec MongoDB
      app.use('/api/auth', authRoutes);
      app.use('/api/rooms', roomsRoutes);
      app.use('/api/messages', messagesRoutes);
      
      // Socket.IO avec authentification
      io.use(authenticateSocket);
      io.on('connection', (socket) => handleSocketConnection(socket, io));
      
      // Mettre à jour le health check
      app.get('/api/health', (req, res) => {
        res.json({ 
          status: 'OK', 
          message: 'Server is running',
          database: 'Connected'
        });
      });
      
    } else {
      console.log('🔄 Database not available - Using mock routes');
      
      // Mock auth routes
      app.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;
        
        if (email && password) {
          const mockUser = {
            id: '1',
            username: email.split('@')[0],
            email: email,
            isOnline: true,
            lastSeen: new Date()
          };
          
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          res.json({
            token: mockToken,
            user: mockUser
          });
        } else {
          res.status(400).json({ message: 'Email et mot de passe requis' });
        }
      });

      app.post('/api/auth/register', (req, res) => {
        const { username, email, password } = req.body;
        
        if (username && email && password) {
          const mockUser = {
            id: '1',
            username: username,
            email: email,
            isOnline: true,
            lastSeen: new Date()
          };
          
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          res.json({
            token: mockToken,
            user: mockUser
          });
        } else {
          res.status(400).json({ message: 'Tous les champs sont requis' });
        }
      });

      app.post('/api/auth/logout', (req, res) => {
        res.json({ message: 'Déconnexion réussie' });
      });

      // Mock rooms routes
      const mockRooms = [
        {
          _id: '1',
          name: 'Général',
          description: 'Salon de discussion général',
          isPrivate: false,
          createdBy: '1',
          members: ['1'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          name: 'Développement',
          description: 'Discussion sur le développement',
          isPrivate: false,
          createdBy: '1',
          members: ['1'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      app.get('/api/rooms', (req, res) => {
        res.json(mockRooms);
      });

      app.get('/api/rooms/my-rooms', (req, res) => {
        res.json(mockRooms);
      });

      app.post('/api/rooms', (req, res) => {
        const { name, description, isPrivate } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Le nom de la salle est requis' });
        }

        const newRoom = {
          _id: String(Date.now()),
          name,
          description: description || '',
          isPrivate: isPrivate || false,
          createdBy: '1',
          members: ['1'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockRooms.push(newRoom);
        res.status(201).json(newRoom);
      });

      app.post('/api/rooms/:roomId/join', (req, res) => {
        const { roomId } = req.params;
        const room = mockRooms.find(r => r._id === roomId);
        
        if (!room) {
          return res.status(404).json({ message: 'Salle non trouvée' });
        }

        res.json({ message: 'Rejoint la salle avec succès' });
      });

      app.post('/api/rooms/:roomId/leave', (req, res) => {
        const { roomId } = req.params;
        const room = mockRooms.find(r => r._id === roomId);
        
        if (!room) {
          return res.status(404).json({ message: 'Salle non trouvée' });
        }

        res.json({ message: 'Quitté la salle avec succès' });
      });

      app.get('/api/rooms/:roomId', (req, res) => {
        const { roomId } = req.params;
        const room = mockRooms.find(r => r._id === roomId);
        
        if (!room) {
          return res.status(404).json({ message: 'Salle non trouvée' });
        }

        res.json(room);
      });

      // Mock messages routes
      const mockMessages = [
        {
          _id: '1',
          content: 'Bienvenue dans le chat !',
          sender: {
            _id: '1',
            username: 'System',
            email: 'system@chat.com'
          },
          room: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      app.get('/api/messages/room/:roomId', (req, res) => {
        const { roomId } = req.params;
        const roomMessages = mockMessages.filter(m => m.room === roomId);
        res.json(roomMessages);
      });

      app.post('/api/messages', (req, res) => {
        const { content, roomId } = req.body;
        
        if (!content || !roomId) {
          return res.status(400).json({ message: 'Contenu et ID de salle requis' });
        }

        const newMessage = {
          _id: String(Date.now()),
          content,
          sender: {
            _id: '1',
            username: 'User',
            email: 'user@example.com'
          },
          room: roomId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockMessages.push(newMessage);
        res.status(201).json(newMessage);
      });

      // Socket.IO simplifié sans auth
      io.on('connection', (socket) => {
        console.log('Utilisateur connecté (mode mock):', socket.id);
        
        socket.on('disconnect', () => {
          console.log('Utilisateur déconnecté (mode mock):', socket.id);
        });
      });

      // Mettre à jour le health check
      app.get('/api/health', (req, res) => {
        res.json({ 
          status: 'OK', 
          message: 'Server is running',
          database: 'Mock mode'
        });
      });
    }

    // Gestion des erreurs globales
    app.use((err, req, res, next) => {
      console.error('Erreur serveur:', err);
      res.status(500).json({ 
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Start server - Fixed to bind to all interfaces for webcontainer
    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT,  () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🔌 WebSocket available at http://localhost:${PORT}`);
      console.log(`💾 Database: ${isDBConnected ? 'MongoDB' : 'Mock mode'}`);
      console.log(`🌐 CORS configured for webcontainer and localhost`);
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop other processes or use a different port.`);
      }
    });

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();

export { io };