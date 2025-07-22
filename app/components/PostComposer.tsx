'use client'

import { useState, useEffect } from 'react'
import { X, Image, Video, FileText, Upload, Send, Settings, Eye, EyeOff, Globe, Lock, Users } from 'lucide-react'

interface SocialAccount {
  id: string
  platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'reddit'
  username: string
  isConnected: boolean
  accessToken?: string
}

interface PostComposerProps {
  connectedAccounts: SocialAccount[]
  onPublish: (formData: FormData, selectedAccounts: SocialAccount[]) => void
  onClose: () => void
}

const platformConfig = {
  youtube: { name: 'YouTube', icon: 'YT', maxChars: 5000 },
  instagram: { name: 'Instagram', icon: 'IG', maxChars: 2200 },
  tiktok: { name: 'TikTok', icon: 'TT', maxChars: 300 },
  linkedin: { name: 'LinkedIn', icon: 'LI', maxChars: 3000 },
  reddit: { name: 'Reddit', icon: 'RD', maxChars: 40000 },
}

export default function PostComposer({ connectedAccounts, onPublish, onClose }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isYouTubeShort, setIsYouTubeShort] = useState(false)
  const [youtubePrivacy, setYoutubePrivacy] = useState<'public' | 'private' | 'unlisted'>('public')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [youtubeDescription, setYoutubeDescription] = useState('')
  const [youtubeTags, setYoutubeTags] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  // Reset media files when content type changes
  useEffect(() => {
    if (contentType === 'text') {
      setMediaFiles([])
    }
  }, [contentType])

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setMediaFiles(files)
  }

  const handlePublish = async () => {
    if (!content.trim() || selectedAccounts.length === 0) {
      alert('Inserisci del contenuto e seleziona almeno un account')
      return
    }

    // Validate YouTube requirements
    const hasYouTube = connectedAccounts.filter(acc => selectedAccounts.includes(acc.id)).some(acc => acc.platform === 'youtube')
    if (hasYouTube && !youtubeTitle.trim()) {
      alert('Il titolo YouTube è obbligatorio quando pubblichi su YouTube')
      return
    }

    // Validate media requirements
    if (contentType === 'video' && mediaFiles.length === 0) {
      alert('Seleziona un file video per pubblicare contenuto video')
      return
    }
    
    if (contentType === 'image' && mediaFiles.length === 0) {
      alert('Seleziona almeno un\'immagine per pubblicare contenuto con immagini')
      return
    }
    
    // Reset media files when content type is text
    if (contentType === 'text') {
      setMediaFiles([])
    }

    setIsPublishing(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('type', contentType)
      
      // Get selected account objects
      const selectedAccountObjects = connectedAccounts.filter(acc => selectedAccounts.includes(acc.id))
      formData.append('accounts', JSON.stringify(selectedAccountObjects))
      
      if (contentType === 'video') {
        formData.append('isYouTubeShort', isYouTubeShort.toString())
        formData.append('youtubePrivacy', youtubePrivacy)
      }
      
      // Add YouTube-specific fields if YouTube is selected
      const hasYouTube = selectedAccountObjects.some(acc => acc.platform === 'youtube')
      if (hasYouTube) {
        formData.append('youtubeTitle', youtubeTitle)
        formData.append('youtubeDescription', youtubeDescription)
        formData.append('youtubeTags', youtubeTags)
      }
      
      if (mediaFiles.length > 0) {
        mediaFiles.forEach((file, index) => {
          formData.append(`media_${index}`, file)
        })
        formData.append('mediaCount', mediaFiles.length.toString())
      }
      
      await onPublish(formData, selectedAccountObjects)
    } catch (error: any) {
      console.error('Errore nella pubblicazione:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const getMaxChars = () => {
    if (selectedAccounts.length === 0) return 5000
    const selectedPlatforms = connectedAccounts
      .filter(acc => selectedAccounts.includes(acc.id))
      .map(acc => acc.platform)
    
    return Math.min(...selectedPlatforms.map(platform => platformConfig[platform].maxChars))
  }

  const maxChars = getMaxChars()
  const remainingChars = maxChars - content.length

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Crea Nuovo Post</h2>
              <p className="text-gray-600 text-sm">Pubblica su tutti i tuoi social contemporaneamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Content Type Selection */}
          <div className="fade-in">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Tipo di Contenuto
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setContentType('text')}
                className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  contentType === 'text' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    contentType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${
                    contentType === 'text' ? 'text-blue-700' : 'text-gray-700'
                  }`}>Solo Testo</span>
                  <span className="text-xs text-gray-500 text-center">Post testuale semplice</span>
                </div>
              </button>
              <button
                onClick={() => setContentType('image')}
                className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  contentType === 'image' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    contentType === 'image' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <Image className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${
                    contentType === 'image' ? 'text-purple-700' : 'text-gray-700'
                  }`}>Con Immagini</span>
                  <span className="text-xs text-gray-500 text-center">Post con foto</span>
                </div>
              </button>
              <button
                onClick={() => setContentType('video')}
                className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  contentType === 'video' 
                    ? 'border-red-500 bg-red-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    contentType === 'video' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${
                    contentType === 'video' ? 'text-red-700' : 'text-gray-700'
                  }`}>Video</span>
                  <span className="text-xs text-gray-500 text-center">Contenuto video</span>
                </div>
              </button>
            </div>

            {contentType === 'video' && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isYouTubeShort}
                    onChange={(e) => setIsYouTubeShort(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="font-medium text-red-800">
                      YouTube Short
                    </span>
                    <p className="text-sm text-red-600">
                      Video verticale (9:16), massimo 60 secondi
                    </p>
                  </div>
                </label>
              </div>
            )}
            
            {selectedAccounts.some(accId => connectedAccounts.find(acc => acc.id === accId)?.platform === 'youtube') && (
              <div className="mt-6 space-y-6 p-6 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">Impostazioni YouTube</h3>
                </div>
                
                {/* YouTube Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Titolo Video YouTube *
                  </label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Inserisci un titolo accattivante..."
                    maxLength={100}
                    className="input-modern"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Titolo obbligatorio per YouTube</span>
                    <span className={youtubeTitle.length > 80 ? 'text-orange-600' : ''}>
                      {youtubeTitle.length}/100 caratteri
                    </span>
                  </div>
                </div>
                
                {/* YouTube Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Descrizione Video YouTube
                  </label>
                  <textarea
                    value={youtubeDescription}
                    onChange={(e) => setYoutubeDescription(e.target.value)}
                    placeholder="Descrivi il tuo video, aggiungi hashtag e link..."
                    rows={4}
                    maxLength={5000}
                    className="textarea-modern"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Descrizione opzionale ma consigliata</span>
                    <span className={youtubeDescription.length > 4500 ? 'text-orange-600' : ''}>
                      {youtubeDescription.length}/5000 caratteri
                    </span>
                  </div>
                </div>
                
                {/* YouTube Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tag YouTube
                  </label>
                  <input
                    type="text"
                    value={youtubeTags}
                    onChange={(e) => setYoutubeTags(e.target.value)}
                    placeholder="gaming, tutorial, divertente, tech..."
                    className="input-modern"
                  />
                  <div className="text-xs text-gray-600 mt-2">
                    💡 Usa tag rilevanti separati da virgole per migliorare la scopribilità
                  </div>
                </div>
                
                {/* YouTube Privacy */}
                {contentType === 'video' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Privacy YouTube
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setYoutubePrivacy('public')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          youtubePrivacy === 'public'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Globe className={`w-5 h-5 ${
                            youtubePrivacy === 'public' ? 'text-green-600' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            youtubePrivacy === 'public' ? 'text-green-700' : 'text-gray-700'
                          }`}>Pubblico</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setYoutubePrivacy('unlisted')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          youtubePrivacy === 'unlisted'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <EyeOff className={`w-5 h-5 ${
                            youtubePrivacy === 'unlisted' ? 'text-orange-600' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            youtubePrivacy === 'unlisted' ? 'text-orange-700' : 'text-gray-700'
                          }`}>Non in elenco</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setYoutubePrivacy('private')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          youtubePrivacy === 'private'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Lock className={`w-5 h-5 ${
                            youtubePrivacy === 'private' ? 'text-red-600' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            youtubePrivacy === 'private' ? 'text-red-700' : 'text-gray-700'
                          }`}>Privato</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Upload */}
          {(contentType === 'image' || contentType === 'video') && (
            <div className="slide-up">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Carica {contentType === 'image' ? 'Immagini' : 'Video'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Trascina i file qui o clicca per selezionare
                    </p>
                    <p className="text-gray-600">
                      {contentType === 'image' ? 'Formati supportati: JPG, PNG, GIF' : 'Formati supportati: MP4, MOV, AVI'}
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple={contentType === 'image'}
                    accept={contentType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="secondary-button cursor-pointer"
                  >
                    Seleziona File
                  </label>
                </div>
              </div>
              {mediaFiles.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        {mediaFiles.length} file selezionato{mediaFiles.length > 1 ? 'i' : ''}
                      </p>
                      <p className="text-sm text-green-600">
                        {mediaFiles.map(f => f.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  {contentType === 'video' && isYouTubeShort && (
                    <div className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-orange-800">
                        <strong>YouTube Shorts:</strong> Assicurati che il video sia verticale (9:16) e duri massimo 60 secondi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content Input */}
          <div className="slide-up">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Contenuto del Post
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cosa vuoi condividere oggi? Scrivi qualcosa di interessante..."
                rows={8}
                maxLength={maxChars}
                className="textarea-modern text-lg leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  remainingChars < 0 
                    ? 'bg-red-100 text-red-700' 
                    : remainingChars < 50 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {content.length}/{maxChars}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-600">
                💡 Usa emoji e hashtag per aumentare l'engagement
              </span>
              <span className={`font-medium ${
                remainingChars < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {remainingChars} caratteri rimanenti
              </span>
            </div>
          </div>

          {/* Account Selection */}
          <div className="slide-up">
            <div className="flex items-center justify-between mb-6">
              <label className="text-lg font-semibold text-gray-900">
                Seleziona Account
              </label>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  {selectedAccounts.length} di {connectedAccounts.length} selezionati
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedAccounts.map((account) => {
                const config = platformConfig[account.platform]
                const isSelected = selectedAccounts.includes(account.id)
                return (
                  <label key={account.id} className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAccountToggle(account.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        account.platform === 'youtube' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        account.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' :
                        account.platform === 'tiktok' ? 'bg-gradient-to-br from-black to-gray-800' :
                        account.platform === 'linkedin' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                        'bg-gradient-to-br from-orange-500 to-red-500'
                      }`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-lg ${
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}>{config.name}</div>
                        <div className="text-gray-600 font-medium">@{account.username}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Limite: {config.maxChars.toLocaleString()} caratteri
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {selectedAccounts.length > 0 && (
                <span>Pubblicherai su {selectedAccounts.length} piattaforma{selectedAccounts.length > 1 ? 'e' : ''}</span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Annulla
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !content.trim() || selectedAccounts.length === 0 || remainingChars < 0}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isPublishing 
                    ? 'bg-gray-400 text-white' 
                    : 'primary-button'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isPublishing ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Pubblicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Pubblica Ora</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}