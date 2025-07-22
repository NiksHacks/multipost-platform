'use client';

import React from 'react';
import { CheckCircle, Plus, ExternalLink } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface SocialAccountCardProps {
  platform: Platform;
  isConnected: boolean;
  onConnect: () => void;
}

const SocialAccountCard: React.FC<SocialAccountCardProps> = ({
  platform,
  isConnected,
  onConnect,
}) => {
  const getButtonClass = () => {
    if (isConnected) {
      return 'bg-green-50 text-green-700 border-green-200 cursor-default';
    }
    
    switch (platform.id) {
      case 'youtube':
        return 'youtube-button';
      case 'instagram':
      case 'instagram-business':
        return 'instagram-button';
      case 'tiktok':
        return 'tiktok-button';
      case 'linkedin':
        return 'linkedin-button';
      case 'reddit':
        return 'reddit-button';
      default:
        return 'social-button bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getPlatformGradient = () => {
    switch (platform.id) {
      case 'youtube':
        return 'from-red-500 to-red-600';
      case 'instagram':
      case 'instagram-business':
        return 'from-purple-500 via-pink-500 to-orange-500';
      case 'tiktok':
        return 'from-black to-gray-800';
      case 'linkedin':
        return 'from-blue-600 to-blue-700';
      case 'reddit':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group card-modern card-3d floating-card hover:scale-105 transition-all duration-500 relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-4">
          <div className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${getPlatformGradient()} flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 pulse-glow`}>
            {platform.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">{platform.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-500 transition-colors">{platform.description}</p>
            {isConnected && (
              <div className="flex items-center mt-1 space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                <span className="text-green-600 text-xs font-medium">Connesso e attivo</span>
              </div>
            )}
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center space-x-2 bounce-in">
            <CheckCircle className="w-7 h-7 text-green-500 pulse-glow" />
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Attivo</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <button
          onClick={isConnected ? undefined : onConnect}
          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 border interactive-button relative overflow-hidden ${getButtonClass()} ${!isConnected ? 'hover:scale-105 shadow-lg hover:shadow-xl neon-border' : ''}`}
          disabled={isConnected}
        >
          <div className="flex items-center justify-center space-x-2 relative z-10">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 pulse-glow" />
                <span>Account Connesso</span>
                <div className="ml-2 loading-dots"></div>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Connetti {platform.name}</span>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>
          {!isConnected && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          )}
        </button>
        
        {isConnected && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Pronto per la pubblicazione</span>
          </div>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
    </div>
  );
};

export default SocialAccountCard;