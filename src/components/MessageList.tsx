import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Reply, Heart, Smile, Edit, Trash2 } from 'lucide-react';
import { Message } from '../types/chat';
import { User } from '../types/auth';
import { Room } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  room: Room;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, room }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  const shouldGroupMessage = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return false;
    
    const timeDiff = new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (
      currentMessage.sender._id === previousMessage.sender._id &&
      timeDiff < fiveMinutes &&
      !shouldShowDateSeparator(currentMessage, previousMessage)
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun message pour le moment
          </h3>
          <p className="text-gray-600 mb-4">
            Soyez le premier à envoyer un message dans #{room.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
    >
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined;
          const isGrouped = shouldGroupMessage(message, previousMessage);
          const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
          const isOwnMessage = message.sender._id === currentUser.id;

          return (
            <React.Fragment key={message._id}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center py-4">
                  <div className="bg-gray-100 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-gray-600">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`group hover:bg-gray-50 rounded-lg transition-colors ${
                  isGrouped ? 'py-1' : 'py-3'
                } px-4 -mx-4`}
              >
                <div className="flex space-x-3">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${isGrouped ? 'w-10' : ''}`}>
                    {!isGrouped && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {!isGrouped && (
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {message.sender.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-gray-400">(modifié)</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm leading-relaxed break-words">
                          {message.content}
                        </p>
                      </div>

                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                            <Heart size={14} className="text-gray-500" />
                          </button>
                          <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                            <Reply size={14} className="text-gray-500" />
                          </button>
                          {isOwnMessage && (
                            <>
                              <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                                <Edit size={14} className="text-gray-500" />
                              </button>
                              <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                                <Trash2 size={14} className="text-gray-500" />
                              </button>
                            </>
                          )}
                          <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                            <MoreVertical size={14} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp for grouped messages */}
                    {isGrouped && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;