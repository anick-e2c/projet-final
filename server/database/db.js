import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aklive-chat';

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

export default connectDB;