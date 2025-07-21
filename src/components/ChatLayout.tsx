import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Settings, Search, Plus, Hash, Lock, Globe, Crown, UserPlus, MoreVertical } from 'lucide-react';
import { Room, Message } from '../types/chat';
import { User } from '../types/auth';
import RoomList from './RoomList';
import ChatArea from './ChatArea';
import UserList from './UserList';
import CreateRoomModal from './CreateRoomModal';
import { roomsAPI } from '../services/api';
import socketService from '../services/socket';

interface ChatLayoutProps {
  user: User;
  onLogout: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ user, onLogout }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadRooms();
    setupSocketListeners();

    return () => {
      socketService.off('new-message');
      socketService.off('user-joined');
      socketService.off('user-left');
    };
  }, []);

  const loadRooms = async () => {
    try {
      const [myRoomsResponse, allRoomsResponse] = await Promise.all([
        roomsAPI.getMyRooms(),
        roomsAPI.getAllRooms()
      ]);

      const myRooms = myRoomsResponse.data.rooms;
      const allRooms = allRoomsResponse.data.rooms;

      // Combine and deduplicate rooms
      const roomMap = new Map();
      [...myRooms, ...allRooms].forEach(room => {
        roomMap.set(room._id, room);
      });

      const uniqueRooms = Array.from(roomMap.values());
      setRooms(uniqueRooms);

      // Auto-select first room if available
      if (uniqueRooms.length > 0 && !activeRoom) {
        setActiveRoom(uniqueRooms[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.onUserJoined((data) => {
      console.log('Utilisateur rejoint:', data);
    });

    socketService.onUserLeft((data) => {
      console.log('Utilisateur parti:', data);
    });
  };

  const handleRoomSelect = (room: Room) => {
    setActiveRoom(room);
    setMessages([]);
    socketService.joinRoom(room._id);
  };

  const handleCreateRoom = async (roomData: { name: string; description: string; isPrivate: boolean }) => {
    try {
      const response = await roomsAPI.createRoom(roomData);
      const newRoom = response.data.room;
      setRooms(prev => [newRoom, ...prev]);
      setActiveRoom(newRoom);
      setIsCreateRoomOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await roomsAPI.joinRoom(roomId);
      await loadRooms();
    } catch (error) {
      console.error('Erreur lors de l\'adhésion à la salle:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 320 }}
        className="bg-white border-r border-gray-200 flex flex-col shadow-lg"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <MessageSquare className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">AkLiveChat</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-green-600">En ligne</p>
              </div>
            )}
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-hidden">
          <RoomList
            rooms={rooms}
            activeRoom={activeRoom}
            onRoomSelect={handleRoomSelect}
            onJoinRoom={handleJoinRoom}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus size={16} />
              {!sidebarCollapsed && <span>Créer une salle</span>}
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings size={16} />
              {!sidebarCollapsed && <span>Paramètres</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <ChatArea
            room={activeRoom}
            messages={messages}
            setMessages={setMessages}
            currentUser={user}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sélectionnez une salle
              </h3>
              <p className="text-gray-600 mb-6">
                Choisissez une salle de discussion pour commencer à chatter
              </p>
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus size={20} />
                <span>Créer une nouvelle salle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - User List */}
      {activeRoom && (
        <UserList
          room={activeRoom}
          currentUser={user}
        />
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

export default ChatLayout;