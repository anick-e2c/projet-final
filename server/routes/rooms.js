import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all public rooms
router.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar isOnline')
      .sort({ createdAt: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user's rooms
router.get('/my-rooms', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({
      'members.user': req.user.userId
    })
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar isOnline')
      .sort({ updatedAt: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Erreur lors de la récupération des salles de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create a new room
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, isPrivate = false, maxMembers = 100 } = req.body;

    // Check if room name already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Une salle avec ce nom existe déjà' });
    }

    const room = new Room({
      name,
      description,
      creator: req.user.userId,
      isPrivate,
      maxMembers,
      members: [{
        user: req.user.userId,
        joinedAt: new Date()
      }]
    });

    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { rooms: room._id }
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar isOnline');

    res.status(201).json({
      message: 'Salle créée avec succès',
      room: populatedRoom
    });
  } catch (error) {
    console.error('Erreur lors de la création de la salle:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la salle' });
  }
});

// Join a room
router.post('/:roomId/join', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    // Check if user is already a member
    const isMember = room.members.some(member => 
      member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'Vous êtes déjà membre de cette salle' });
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({ message: 'Cette salle est pleine' });
    }

    // Add user to room
    room.members.push({
      user: userId,
      joinedAt: new Date()
    });
    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(userId, {
      $push: { rooms: roomId }
    });

    const populatedRoom = await Room.findById(roomId)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar isOnline');

    res.json({
      message: 'Vous avez rejoint la salle avec succès',
      room: populatedRoom
    });
  } catch (error) {
    console.error('Erreur lors de l\'adhésion à la salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Leave a room
router.post('/:roomId/leave', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    // Remove user from room members
    room.members = room.members.filter(member => 
      member.user.toString() !== userId
    );
    await room.save();

    // Remove room from user's rooms
    await User.findByIdAndUpdate(userId, {
      $pull: { rooms: roomId }
    });

    res.json({ message: 'Vous avez quitté la salle avec succès' });
  } catch (error) {
    console.error('Erreur lors de la sortie de la salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get room details
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Erreur lors de la récupération de la salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;