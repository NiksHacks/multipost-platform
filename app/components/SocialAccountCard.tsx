'use client'

import { LinkIcon } from '@heroicons/react/24/outline'

interface SocialPlatform {
  id: string
  name: string
  color: string
  icon: string
}

interface SocialAccountCardProps {
  platform: SocialPlatform
  isConnected: boolean
  connectedCount?: number
  onConnect: () => void
}

export default function SocialAccountCard({ platform, isConnected, connectedCount = 0, onConnect }: SocialAccountCardProps) {
  return (
    <div className="social-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`text-2xl mr-3`}>{platform.icon}</div>
          <h3 className="text-lg font-medium text-gray-900">{platform.name}</h3>
        </div>
        {connectedCount > 0 && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {connectedCount} connessi
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        {isConnected 
          ? `${connectedCount} account ${platform.name} ${connectedCount === 1 ? 'connesso' : 'connessi'}. Puoi connettere account aggiuntivi.` 
          : `Connetti il tuo account ${platform.name} per pubblicare contenuti`}
      </p>
      
      <button
        onClick={onConnect}
        className={`${platform.color}-button w-full`}
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        {isConnected ? 'Connetti Altro Account' : 'Connetti Account'}
      </button>
    </div>
  )
}