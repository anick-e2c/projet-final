import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aklive-chat-secret-key-2024';

// HTTP middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Socket.IO middleware
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token d\'authentification requis'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error('Token invalide'));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification Socket.IO:', error);
    next(new Error('Token invalide'));
  }
};