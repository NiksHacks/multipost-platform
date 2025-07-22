'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import SocialAccountCard from './components/SocialAccountCard';
import PostComposer from './components/PostComposer';
import ConnectedAccounts from './components/ConnectedAccounts';
import { toast } from 'sonner';
import { Plus, Zap, Users, Share2, TrendingUp, Sparkles } from 'lucide-react';
import { StrategoAnimations, ParticleBackground, TypewriterEffect, CountUpAnimation } from './components/StrategoAnimations';

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
  const [showPostComposer, setShowPostComposer] = useState(false)

  // Load connected accounts from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccounts = localStorage.getItem('connectedAccounts')
      if (savedAccounts) {
        try {
          setConnectedAccounts(JSON.parse(savedAccounts))
        } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    <StrategoAnimations>
      <div className="min-h-screen relative">
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Hero Header */}
        <header className="relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center stratego-logo neon-border">
                <Sparkles className="w-8 h-8 text-white pulse-glow" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-3 tracking-tight">
                  <span className="stratego-title">
                    Stratego Multi Post
                  </span>
                </h1>
                <p className="text-blue-100 text-xl font-medium opacity-90">
                   <TypewriterEffect text="La piattaforma professionale per gestire tutti i tuoi social media" speed={50} />
                 </p>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                  <span className="text-green-200 text-sm font-medium">Sistema attivo e operativo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <div className="text-right">
                    <p className="text-white font-medium">Ciao, {session.user?.name}</p>
                    <p className="text-white/70 text-sm">Benvenuto nel tuo dashboard</p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-white/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Accedi
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Account Connessi</p>
                  <p className="text-white text-2xl font-bold">
                    <CountUpAnimation end={connectedAccounts.length} duration={1500} />
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Piattaforme</p>
                  <p className="text-white text-2xl font-bold">
                    <CountUpAnimation end={socialPlatforms.length} duration={1800} />
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Engagement</p>
                  <p className="text-white text-2xl font-bold">+24%</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Post Oggi</p>
                  <p className="text-white text-2xl font-bold">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!session ? (
          <div className="text-center py-20">
            <div className="card-modern max-w-2xl mx-auto fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold gradient-text mb-6">
                <TypewriterEffect text="Benvenuto su Stratego Multi Post" speed={80} />
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Gestisci tutti i tuoi account social media da un'unica piattaforma.
                Pubblica, programma e monitora i tuoi contenuti con facilità.
              </p>
              <button
                onClick={() => signIn()}
                className="primary-button text-xl px-12 py-4 bounce-in"
              >
                Inizia Ora
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Connected Accounts Section */}
            {connectedAccounts.length > 0 && (
              <section className="slide-up">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Account Connessi</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Tutti i servizi attivi</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {connectedAccounts.map((account, index) => (
                    <div key={account.id} className="card-modern fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                            account.platform === 'youtube' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            account.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' :
                            account.platform === 'tiktok' ? 'bg-gradient-to-br from-black to-gray-800' :
                            account.platform === 'linkedin' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                            'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {account.platform.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg capitalize">{account.platform}</h3>
                            <p className="text-gray-600 font-medium">@{account.username}</p>
                          </div>
                        </div>
                        <span className="status-badge status-connected">
                          ● Connesso
                        </span>
                      </div>
                      <button
                        onClick={() => handleDisconnectAccount(account.id)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border border-red-200"
                      >
                        Disconnetti Account
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Available Platforms Section */}
            <section className="slide-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Piattaforme Disponibili</h2>
                <p className="text-gray-600">Connetti i tuoi account social preferiti</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {socialPlatforms.map((platform, index) => (
                  <div key={platform.id} className="fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <SocialAccountCard
                      platform={platform}
                      isConnected={connectedAccounts.some(acc => acc.platform === platform.id)}
                      onConnect={() => handleConnectAccount(platform.id)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            {connectedAccounts.length > 0 && (
              <section className="slide-up">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Azioni Rapide</h2>
                <div className="card-modern">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setShowPostComposer(true)}
                      className="group bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-8 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">Crea Nuovo Post</h3>
                          <p className="text-white/80 text-sm">Pubblica su tutti i tuoi social</p>
                        </div>
                      </div>
                    </button>
                    <button className="group bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white p-8 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">Analytics</h3>
                          <p className="text-white/80 text-sm">Monitora le performance</p>
                        </div>
                      </div>
                    </button>
                    <button className="group bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-8 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">Programmazione</h3>
                          <p className="text-white/80 text-sm">Gestisci i post futuri</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Post Composer Modal */}
      {showPostComposer && (
        <div className="modal-overlay fade-in">
          <div className="modal-content bounce-in">
            <PostComposer
              connectedAccounts={connectedAccounts}
              onClose={() => setShowPostComposer(false)}
              onPublish={handlePublishPost}
            />
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      {session && connectedAccounts.length > 0 && (
        <button
          onClick={() => setShowPostComposer(true)}
          className="floating-action flex items-center justify-center"
          title="Crea nuovo post"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      )}
      </div>
    </StrategoAnimations>
  )
}