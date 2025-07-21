import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, Shield, Heart, Star } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const features = [
    { icon: MessageCircle, text: "Messagerie instantanée" },
    { icon: Users, text: "Salons de discussion" },
    { icon: Zap, text: "Temps réel" },
    { icon: Shield, text: "Sécurisé" }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration and Features */}
      <div className="hidden lg:flex lg:w-1/2 chat-gradient relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
                <MessageCircle size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold">AkLiveChat</h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              Connectez-vous instantanément avec vos amis et collègues. 
              Une expérience de chat moderne et sécurisée.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <feature.icon size={20} className="text-white" />
                </div>
                <span className="text-white/90 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex space-x-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center"
                >
                  <Heart size={16} className="text-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="text-yellow-300 fill-current" />
                ))}
              </div>
              <span className="text-sm text-white/80">Adoré par nos utilisateurs</span>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse-slow"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-white/5 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-white/10 rounded-full animate-bounce-slow"></div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;