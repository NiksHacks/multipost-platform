'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface SocialAccount {
  id: string
  platform: 'youtube' | 'instagram' | 'instagram-business' | 'tiktok' | 'linkedin' | 'reddit'
  username: string
  isConnected: boolean
  accessToken?: string
}

interface ConnectedAccountsProps {
  accounts: SocialAccount[]
  onDisconnect: (accountId: string) => void
}

const platformConfig = {
  youtube: { name: 'YouTube', icon: 'YT', color: 'bg-youtube' },
  instagram: { name: 'Instagram', icon: 'IG', color: 'bg-instagram' },
  'instagram-business': { name: 'Instagram Business', icon: 'IB', color: 'bg-instagram' },
  tiktok: { name: 'TikTok', icon: 'TT', color: 'bg-tiktok' },
  linkedin: { name: 'LinkedIn', icon: 'LI', color: 'bg-linkedin' },
  reddit: { name: 'Reddit', icon: 'RD', color: 'bg-reddit' },
}

export default function ConnectedAccounts({ accounts, onDisconnect }: ConnectedAccountsProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nessun account connesso</p>
        <p className="text-sm text-gray-400 mt-1">
          Connetti i tuoi account social per iniziare a pubblicare
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => {
        const config = platformConfig[account.platform]
        return (
          <div key={account.id} className="social-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="text-xl mr-2">{config.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{config.name}</h4>
                  <p className="text-sm text-gray-500">@{account.username}</p>
                </div>
              </div>
              <button
                onClick={() => onDisconnect(account.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Disconnetti account"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${config.color} mr-2`}></div>
              <span className="text-sm text-green-600 font-medium">Connesso</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}