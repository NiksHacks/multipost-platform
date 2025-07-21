'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentIcon } from '@heroicons/react/24/outline'

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
    } catch (error) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Crea Nuovo Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Content Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo di Contenuto
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setContentType('text')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  contentType === 'text' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <DocumentIcon className="h-4 w-4 mr-2" />
                Testo
              </button>
              <button
                onClick={() => setContentType('image')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  contentType === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <PhotoIcon className="h-4 w-4 mr-2" />
                Immagine
              </button>
              <button
                onClick={() => setContentType('video')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  contentType === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Video
              </button>
            </div>

            {contentType === 'video' && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isYouTubeShort}
                    onChange={(e) => setIsYouTubeShort(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Carica come YouTube Short (video verticale, max 60 secondi)
                  </span>
                </label>
              </div>
            )}
            
            {selectedAccounts.some(accId => connectedAccounts.find(acc => acc.id === accId)?.platform === 'youtube') && (
              <div className="mt-4 space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-3">⚙️ Impostazioni YouTube</h3>
                
                {/* YouTube Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo Video YouTube *
                  </label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Inserisci il titolo del video..."
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {youtubeTitle.length}/100 caratteri
                  </div>
                </div>
                
                {/* YouTube Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione Video YouTube
                  </label>
                  <textarea
                    value={youtubeDescription}
                    onChange={(e) => setYoutubeDescription(e.target.value)}
                    placeholder="Descrizione del video (opzionale)..."
                    rows={3}
                    maxLength={5000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {youtubeDescription.length}/5000 caratteri
                  </div>
                </div>
                
                {/* YouTube Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag YouTube
                  </label>
                  <input
                    type="text"
                    value={youtubeTags}
                    onChange={(e) => setYoutubeTags(e.target.value)}
                    placeholder="tag1, tag2, tag3 (separati da virgole)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Inserisci i tag separati da virgole (es: gaming, tutorial, divertente)
                  </div>
                </div>
                
                {/* YouTube Privacy */}
                {contentType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Privacy YouTube
                    </label>
                    <select
                      value={youtubePrivacy}
                      onChange={(e) => setYoutubePrivacy(e.target.value as 'public' | 'private' | 'unlisted')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Pubblico</option>
                      <option value="private">Privato</option>
                      <option value="unlisted">Non in elenco</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Upload */}
          {(contentType === 'image' || contentType === 'video') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carica {contentType === 'image' ? 'Immagini' : 'Video'}
              </label>
              <input
                type="file"
                multiple={contentType === 'image'}
                accept={contentType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleMediaUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {mediaFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {mediaFiles.length} file selezionato/i
                  </p>
                  {contentType === 'video' && isYouTubeShort && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Assicurati che il video sia verticale (9:16) e duri massimo 60 secondi per YouTube Shorts
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenuto del Post
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrivi il tuo post qui..."
              rows={6}
              maxLength={maxChars}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">
                Caratteri rimanenti: {remainingChars}
              </span>
              <span className={remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}>
                {content.length}/{maxChars}
              </span>
            </div>
          </div>

          {/* Account Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Account ({selectedAccounts.length} selezionati)
            </label>
            <div className="space-y-2">
              {connectedAccounts.map((account) => {
                const config = platformConfig[account.platform]
                return (
                  <label key={account.id} className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleAccountToggle(account.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="text-lg mr-3">{config.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{config.name}</div>
                      <div className="text-sm text-gray-500">@{account.username}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Max {config.maxChars} caratteri
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annulla
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !content.trim() || selectedAccounts.length === 0 || remainingChars < 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Pubblicando...' : 'Pubblica'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}