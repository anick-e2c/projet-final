import express from 'express';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a room
router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is member of the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    const isMember = room.members.some(member => 
      member.user.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Vous n\'êtes pas membre de cette salle' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ 
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, roomId, messageType = 'text' } = req.body;

    // Check if user is member of the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    const isMember = room.members.some(member => 
      member.user.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Vous n\'êtes pas membre de cette salle' });
    }

    const message = new Message({
      content,
      sender: req.user.userId,
      room: roomId,
      messageType
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
  }
});

// Edit a message
router.put('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres messages' });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.json({
      message: 'Message modifié avec succès',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Erreur lors de la modification du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete a message
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres messages' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;