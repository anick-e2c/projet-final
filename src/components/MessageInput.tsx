import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, Image, FileText, Mic } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  placeholder = "Tapez votre message..."
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <Paperclip size={20} />
            </button>
          </div>

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div className="bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              {/* Input Actions */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <Smile size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <Image size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <Mic size={16} />
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  Entrée pour envoyer, Maj+Entrée pour nouvelle ligne
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex-shrink-0">
            <motion.button
              type="submit"
              disabled={!message.trim()}
              whileHover={{ scale: message.trim() ? 1.05 : 1 }}
              whileTap={{ scale: message.trim() ? 0.95 : 1 }}
              className={`p-3 rounded-full transition-all duration-200 ${
                message.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;