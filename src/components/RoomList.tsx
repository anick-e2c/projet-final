import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Lock, Globe, Users, Search, Crown, UserPlus } from 'lucide-react';
import { Room } from '../types/chat';

interface RoomListProps {
  rooms: Room[];
  activeRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onJoinRoom: (roomId: string) => void;
  collapsed: boolean;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoom,
  onRoomSelect,
  onJoinRoom,
  collapsed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'public'>('all');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'joined':
        return matchesSearch && room.members.some(member => member.user._id);
      case 'public':
        return matchesSearch && !room.isPrivate;
      default:
        return matchesSearch;
    }
  });

  const isUserInRoom = (room: Room, userId: string) => {
    return room.members.some(member => member.user._id === userId);
  };

  if (collapsed) {
    return (
      <div className="p-2 space-y-2">
        {filteredRooms.slice(0, 5).map((room) => (
          <motion.button
            key={room._id}
            onClick={() => onRoomSelect(room)}
            className={`w-full p-2 rounded-lg transition-colors ${
              activeRoom?._id === room._id
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {room.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher des salles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'joined', label: 'Rejointes' },
            { key: 'public', label: 'Publiques' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto px-2">
        <AnimatePresence>
          {filteredRooms.map((room) => {
            const isActive = activeRoom?._id === room._id;
            const memberCount = room.members.length;
            const isJoined = isUserInRoom(room, 'current-user-id'); // You'll need to pass the current user ID

            return (
              <motion.div
                key={room._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {room.isPrivate ? (
                          <Lock size={14} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                        ) : (
                          <Hash size={14} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                        )}
                      </div>
                      <h3 className={`font-semibold text-sm truncate ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {room.name}
                      </h3>
                      {room.creator._id === 'current-user-id' && (
                        <Crown size={12} className="text-yellow-500" />
                      )}
                    </div>
                    
                    {!isJoined && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinRoom(room._id);
                        }}
                        className="p-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        <UserPlus size={14} className="text-blue-600" />
                      </button>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {room.isPrivate ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Privée
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Publique
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <Hash size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune salle trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;