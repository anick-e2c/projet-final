import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const connectedUsers = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log(`✅ Utilisateur connecté: ${socket.user.username} (${socket.id})`);
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user
  });

  // Update user online status
  updateUserOnlineStatus(socket.userId, true);

  // Join user to their rooms
  joinUserRooms(socket);

  // Handle joining a room
  socket.on('join-room', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Salle non trouvée' });
        return;
      }

      const isMember = room.members.some(member => 
        member.user.toString() === socket.userId
      );

      if (!isMember) {
        socket.emit('error', { message: 'Vous n\'êtes pas membre de cette salle' });
        return;
      }

      socket.join(roomId);
      
      // Notify other users in the room
      socket.to(roomId).emit('user-joined', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        message: `${socket.user.username} a rejoint la salle`
      });

      console.log(`👥 ${socket.user.username} a rejoint la salle ${room.name}`);
    } catch (error) {
      console.error('Erreur lors de l\'adhésion à la salle:', error);
      socket.emit('error', { message: 'Erreur lors de l\'adhésion à la salle' });
    }
  });

  // Handle leaving a room
  socket.on('leave-room', async (roomId) => {
    try {
      socket.leave(roomId);
      
      const room = await Room.findById(roomId);
      if (room) {
        // Notify other users in the room
        socket.to(roomId).emit('user-left', {
          user: {
            id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          message: `${socket.user.username} a quitté la salle`
        });

        console.log(`👋 ${socket.user.username} a quitté la salle ${room.name}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sortie de la salle:', error);
    }
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { content, roomId, messageType = 'text' } = data;

      // Verify user is member of the room
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Salle non trouvée' });
        return;
      }

      const isMember = room.members.some(member => 
        member.user.toString() === socket.userId
      );

      if (!isMember) {
        socket.emit('error', { message: 'Vous n\'êtes pas membre de cette salle' });
        return;
      }

      // Create and save message
      const message = new Message({
        content,
        sender: socket.userId,
        room: roomId,
        messageType
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar');

      // Send message to all users in the room
      io.to(roomId).emit('new-message', populatedMessage);

      console.log(`💬 Message de ${socket.user.username} dans ${room.name}: ${content}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: socket.userId,
      username: socket.user.username,
      roomId: data.roomId
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      userId: socket.userId,
      roomId: data.roomId
    });
  });

  // Handle message reactions
  socket.on('message-reaction', async (data) => {
    try {
      const { messageId, reaction } = data;
      
      // Here you could implement message reactions logic
      // For now, just broadcast to the room
      const message = await Message.findById(messageId).populate('room');
      if (message) {
        socket.to(message.room._id.toString()).emit('message-reaction', {
          messageId,
          reaction,
          userId: socket.userId,
          username: socket.user.username
        });
      }
    } catch (error) {
      console.error('Erreur lors de la réaction au message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Utilisateur déconnecté: ${socket.user.username} (${socket.id})`);
    
    // Remove user from connected users
    connectedUsers.delete(socket.userId);
    
    // Update user offline status
    updateUserOnlineStatus(socket.userId, false);
    
    // Notify all rooms that user went offline
    notifyUserOffline(socket, io);
  });
};

const joinUserRooms = async (socket) => {
  try {
    const user = await User.findById(socket.userId).populate('rooms');
    if (user && user.rooms) {
      user.rooms.forEach(room => {
        socket.join(room._id.toString());
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'adhésion aux salles de l\'utilisateur:', error);
  }
};

const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
  }
};

const notifyUserOffline = async (socket, io) => {
  try {
    const user = await User.findById(socket.userId).populate('rooms');
    if (user && user.rooms) {
      user.rooms.forEach(room => {
        socket.to(room._id.toString()).emit('user-offline', {
          userId: socket.userId,
          username: socket.user.username
        });
      });
    }
  } catch (error) {
    console.error('Erreur lors de la notification hors ligne:', error);
  }
};

export { connectedUsers };