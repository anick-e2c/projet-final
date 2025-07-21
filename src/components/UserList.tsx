import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Shield, User, MoreVertical, UserMinus, UserPlus, Settings } from 'lucide-react';
import { Room } from '../types/chat';
import { User as UserType } from '../types/auth';

interface UserListProps {
  room: Room;
  currentUser: UserType;
}

const UserList: React.FC<UserListProps> = ({ room, currentUser }) => {
  const [collapsed, setCollapsed] = useState(false);

  const sortedMembers = [...room.members].sort((a, b) => {
    // Creator first
    if (a.user._id === room.creator._id) return -1;
    if (b.user._id === room.creator._id) return 1;
    
    // Online users next
    if (a.user.isOnline && !b.user.isOnline) return -1;
    if (!a.user.isOnline && b.user.isOnline) return 1;
    
    // Alphabetical
    return a.user.username.localeCompare(b.user.username);
  });

  const onlineCount = room.members.filter(member => member.user.isOnline).length;
  const offlineCount = room.members.length - onlineCount;

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors mb-4"
        >
          <Users size={20} className="text-gray-600" />
        </button>
        <div className="text-xs text-gray-500 font-medium">
          {room.members.length}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 280 }}
      className="bg-gray-50 border-l border-gray-200 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Membres</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {room.members.length}
            </span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        {/* Online Members */}
        {onlineCount > 0 && (
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                En ligne — {onlineCount}
              </span>
            </div>
            
            <div className="space-y-2">
              {sortedMembers
                .filter(member => member.user.isOnline)
                .map((member) => (
                  <UserItem
                    key={member.user._id}
                    member={member}
                    room={room}
                    currentUser={currentUser}
                    isOnline={true}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineCount > 0 && (
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Hors ligne — {offlineCount}
              </span>
            </div>
            
            <div className="space-y-2">
              {sortedMembers
                .filter(member => !member.user.isOnline)
                .map((member) => (
                  <UserItem
                    key={member.user._id}
                    member={member}
                    room={room}
                    currentUser={currentUser}
                    isOnline={false}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <UserPlus size={16} />
          <span>Inviter des membres</span>
        </button>
      </div>
    </motion.div>
  );
};

interface UserItemProps {
  member: Room['members'][0];
  room: Room;
  currentUser: UserType;
  isOnline: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ member, room, currentUser, isOnline }) => {
  const [showActions, setShowActions] = useState(false);
  const isCreator = member.user._id === room.creator._id;
  const isCurrentUser = member.user._id === currentUser.id;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isOnline 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gray-400'
          }`}>
            <span className="text-white text-xs font-semibold">
              {member.user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium truncate ${
              isOnline ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {member.user.username}
            </span>
            {isCreator && (
              <Crown size={12} className="text-yellow-500 flex-shrink-0" />
            )}
            {isCurrentUser && (
              <span className="text-xs text-blue-600 font-medium">(vous)</span>
            )}
          </div>
          {!isOnline && (
            <p className="text-xs text-gray-400">
              Vu pour la dernière fois il y a 2h
            </p>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && !isCurrentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-1"
            >
              <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                <User size={12} className="text-gray-500" />
              </button>
              {currentUser.id === room.creator._id && !isCreator && (
                <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                  <UserMinus size={12} className="text-red-500" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserList;