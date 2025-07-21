import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical, Hash, Lock, Users, Settings } from 'lucide-react';
import { Room, Message } from '../types/chat';
import { User } from '../types/auth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';

interface ChatAreaProps {
  room: Room;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentUser: User;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  room,
  messages,
  setMessages,
  currentUser
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();

    return () => {
      socketService.off('user-typing');
      socketService.off('user-stop-typing');
    };
  }, [room._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await messagesAPI.getRoomMessages(room._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onUserTyping((data) => {
      if (data.roomId === room._id && data.userId !== currentUser.id) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (data.roomId === room._id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      const messageData = {
        content: content.trim(),
        roomId: room._id,
        messageType: 'text' as const
      };

      // Send via socket for real-time delivery
      socketService.sendMessage(messageData);

      // Also send via API for persistence
      await messagesAPI.sendMessage(messageData);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (isTyping) {
      socketService.startTyping(room._id);
    } else {
      socketService.stopTyping(room._id);
    }
  };

  const memberCount = room.members.length;
  const onlineCount = room.members.filter(member => member.user.isOnline).length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                room.isPrivate 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {room.isPrivate ? <Lock size={20} /> : <Hash size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{onlineCount} en ligne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {room.description && (
          <p className="mt-2 text-gray-600 text-sm">{room.description}</p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Chargement des messages...</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUser={currentUser}
              room={room}
            />
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-6 py-2 text-sm text-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? 'Quelqu\'un écrit...' 
                        : `${typingUsers.length} personnes écrivent...`
                      }
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder={`Écrire dans #${room.name}...`}
        />
      </div>
    </div>
  );
};

export default ChatArea;