export default {
  port: process.env.PORT || 10000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aklive-chat'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key'
  },
  cors: {
    origin: [
      'https://localhost:5173',
      'https://your-frontend-domain.com', // Remplacez par votre domaine frontend
      /\.render\.com$/,
      /\.vercel\.app$/,
      /\.netlify\.app$/
    ]
  }
};