'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { PlusIcon, LinkIcon, ShareIcon } from '@heroicons/react/24/outline'
import SocialAccountCard from './components/SocialAccountCard'
import PostComposer from './components/PostComposer'
import ConnectedAccounts from './components/ConnectedAccounts'

interface SocialAccount {
  id: string
  platform: 'youtube' | 'instagram' | 'instagram-business' | 'tiktok' | 'linkedin' | 'reddit'
  username: string
  isConnected: boolean
  accessToken?: string
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([])
  const [showComposer, setShowComposer] = useState(false)

  // Load connected accounts from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccounts = localStorage.getItem('connectedAccounts')
      if (savedAccounts) {
        try {
          setConnectedAccounts(JSON.parse(savedAccounts))
        } catch (error) {
          console.error('Error loading saved accounts:', error)
        }
      }
    }
  }, [])

  // Effect to handle session changes and update connected accounts
  useEffect(() => {
    if (session?.user && session.provider) {
      // Map providers to platforms
      const platformMapping: { [key: string]: string } = {
        'google': 'youtube',
        'instagram': 'instagram',
        'instagram-business': 'instagram-business',
        'linkedin': 'linkedin',
        'reddit': 'reddit',
        'tiktok': 'tiktok'
      }
      
      const mappedPlatform = platformMapping[session.provider] || session.provider
      
      // Create unique ID combining platform and user identifier
      const uniqueId = `${mappedPlatform}-${session.user.id || session.user.email || Date.now()}`
      
      const newAccount: SocialAccount = {
        id: uniqueId,
        platform: mappedPlatform as any,
        username: session.user.name || session.user.email || 'Unknown User',
        isConnected: true,
        accessToken: session.accessToken
      }
      
      // Check if account is already connected (by platform and username)
      setConnectedAccounts(prev => {
        const exists = prev.some(acc => 
          acc.platform === mappedPlatform && 
          acc.username === newAccount.username
        )
        
        if (!exists) {
          const updatedAccounts = [...prev, newAccount]
          // Save to localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('connectedAccounts', JSON.stringify(updatedAccounts))
          }
          return updatedAccounts
        }
        return prev
      })
    }
  }, [session])

  const socialPlatforms = [
    { id: 'youtube', name: 'YouTube', color: 'youtube', icon: 'YT' },
    { id: 'instagram', name: 'Instagram (Personal)', color: 'instagram', icon: 'IG' },
    { id: 'instagram-business', name: 'Instagram Business', color: 'instagram', icon: 'IB' },
    { id: 'tiktok', name: 'TikTok', color: 'tiktok', icon: 'TT' },
    { id: 'linkedin', name: 'LinkedIn', color: 'linkedin', icon: 'LI' },
    { id: 'reddit', name: 'Reddit', color: 'reddit', icon: 'RD' },
  ]

  const handleConnectAccount = async (platform: string) => {
    try {
      // Map platforms to authentication providers
      const authPlatform = platform === 'youtube' ? 'google' : platform
      
      // Use NextAuth signIn function with callback URL
      await signIn(authPlatform, { 
        callbackUrl: window.location.origin,
        redirect: true 
      })
    } catch (error) {
      console.error('Errore nella connessione:', error)
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      // Remove from state and localStorage
      setConnectedAccounts(prev => {
        const updatedAccounts = prev.filter(acc => acc.id !== accountId)
        if (typeof window !== 'undefined') {
          localStorage.setItem('connectedAccounts', JSON.stringify(updatedAccounts))
        }
        return updatedAccounts
      })
      
      // Optional: Call API to revoke tokens if endpoint exists
      try {
        await fetch(`/api/accounts/${accountId}`, {
          method: 'DELETE',
        })
      } catch (apiError) {
        console.log('API disconnect endpoint not available, account removed locally')
      }
    } catch (error) {
      console.error('Errore nella disconnessione:', error)
    }
  }

  const handlePublishPost = async (formData: FormData, selectedAccounts: SocialAccount[]) => {
    try {
      // Aggiungi gli account selezionati al FormData se non sono già presenti
      if (!formData.has('accounts')) {
        formData.append('accounts', JSON.stringify(selectedAccounts));
      }
      
      // Aggiungi informazioni sulla sessione corrente
      if (session?.accessToken) {
        formData.append('sessionData', JSON.stringify({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          provider: session.provider
        }));
      }
      
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        alert('Post pubblicato con successo!');
        setShowComposer(false)
      } else {
        // Estrai gli errori dai risultati
        let errorMessage = result.message || 'Errore sconosciuto';
        if (result.results && result.results.length > 0) {
          const errors = result.results
            .filter((r: any) => !r.success)
            .map((r: any) => `${r.platform}: ${r.error || 'Errore sconosciuto'}`)
            .join('\n');
          if (errors) {
            errorMessage = errors;
          }
        }
        console.error('Publication error:', errorMessage);
        alert(`Errore nella pubblicazione:\n${errorMessage}`);
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nella pubblicazione del post');
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Benvenuto su MultiPost Platform
            </h1>
            <p className="text-gray-600">
              Gestisci tutti i tuoi account social e pubblica contenuti con un solo click
            </p>
          </div>
          {session && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">
                Connesso come: <span className="font-medium">{session.user?.name || session.user?.email}</span>
              </p>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Disconnetti
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Account Connessi</h2>
          <button
            onClick={() => setShowComposer(true)}
            disabled={connectedAccounts.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Nuovo Post
          </button>
        </div>
        
        {connectedAccounts.length > 0 ? (
          <ConnectedAccounts 
            accounts={connectedAccounts}
            onDisconnect={handleDisconnectAccount}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">Nessun account connesso</p>
            <p className="text-sm text-gray-400">Connetti un account social per iniziare a pubblicare contenuti</p>
          </div>
        )}
      </div>

      {/* Available Platforms */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connetti Nuovi Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialPlatforms.map((platform) => {
            const connectedCount = connectedAccounts.filter(acc => acc.platform === platform.id).length
            return (
              <SocialAccountCard
                key={platform.id}
                platform={platform}
                isConnected={connectedCount > 0}
                connectedCount={connectedCount}
                onConnect={() => handleConnectAccount(platform.id)}
              />
            )
          })}
        </div>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          connectedAccounts={connectedAccounts as unknown as SocialAccount[]}
          onPublish={handlePublishPost}
          onClose={() => setShowComposer(false)}
        />
      )}
    </div>
  )
}