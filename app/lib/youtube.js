import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Configurazione OAuth2 per YouTube
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/auth/callback/google'
);

// Debug: verifica configurazione
console.log('YouTube OAuth2 Config:', {
  clientId: process.env.YOUTUBE_CLIENT_ID ? 'SET' : 'NOT SET',
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET ? 'SET' : 'NOT SET',
  redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'DEFAULT'
});

// Funzione per impostare le credenziali
export function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

// Funzione per rinnovare il token di accesso
export async function refreshAccessToken(refreshToken) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('Token refreshed successfully:', { hasAccessToken: !!credentials.access_token });
    
    oauth2Client.setCredentials(credentials);
    return {
      success: true,
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken
    };
  } catch (error) {
    console.error('Errore nel refresh del token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * @param {object} options
 * @param {import('fs').ReadStream} options.videoFile
 * @param {string} options.title
 * @param {string} options.description
 * @param {string[]} [options.tags]
 * @param {'public' | 'private' | 'unlisted'} [options.privacyStatus]
 * @param {boolean} [options.isShort]
 */
export async function uploadVideoToYouTube({
  videoFile,
  title,
  description,
  tags = [],
  privacyStatus = 'public',
  isShort = false
}) {
  console.log('uploadVideoToYouTube called with:', { hasVideoFile: !!videoFile, title, description, tags, privacyStatus, isShort });
  
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    console.log('YouTube API client created successfully');

    // Prepara i metadati del video
    const videoMetadata = {
      snippet: {
        title: title,
        description: description,
        tags: tags,
        categoryId: '22', // People & Blogs
        defaultLanguage: 'it',
        defaultAudioLanguage: 'it'
      },
      status: {
        privacyStatus: privacyStatus,
        selfDeclaredMadeForKids: false
      }
    };

    // Se è uno Short, aggiungi #Shorts nel titolo se non c'è già
    if (isShort && !title.toLowerCase().includes('#shorts')) {
      videoMetadata.snippet.title = `${title} #Shorts`;
    }

    // Carica il video
    console.log('Starting video upload with metadata:', videoMetadata);
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: videoFile
      }
    });
    console.log('Video upload response received:', { videoId: response.data?.id, status: response.status });

    const result = {
      success: true,
      videoId: response.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
      title: response.data.snippet?.title,
      description: response.data.snippet?.description
    };
    console.log('Returning success result:', result);
    return result;
  } catch (error) {
    console.error('Errore durante l\'upload su YouTube:', error);
    console.error('Error details:', { message: error.message, code: error.code, errors: error.errors });
    const errorResult = {
      success: false,
      error: error.message || 'Errore sconosciuto durante l\'upload'
    };
    console.log('Returning error result:', errorResult);
    return errorResult;
  }
}

// Funzione per verificare se un video è idoneo per essere uno Short
export function isVideoEligibleForShorts(duration, aspectRatio) {
  // YouTube Shorts devono essere:
  // - Durata massima 60 secondi
  // - Aspect ratio verticale (9:16) o quadrato (1:1)
  const maxDuration = 60; // secondi
  const validAspectRatios = ['9:16', '1:1', '16:9']; // Accettiamo anche 16:9 per flessibilità
  
  return duration <= maxDuration && validAspectRatios.includes(aspectRatio);
}

// Funzione per ottenere informazioni sul video
export async function getVideoInfo(videoId) {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const response = await youtube.videos.list({
      part: ['snippet', 'status', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    if (response.data.items && response.data.items.length > 0) {
      return {
        success: true,
        video: response.data.items[0]
      };
    } else {
      return {
        success: false,
        error: 'Video non trovato'
      };
    }
  } catch (error) {
    console.error('Errore nel recupero informazioni video:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funzione per aggiornare i metadati di un video
export async function updateVideoMetadata(videoId, updates) {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const response = await youtube.videos.update({
      part: ['snippet', 'status'],
      requestBody: {
        id: videoId,
        ...updates
      }
    });

    return {
      success: true,
      video: response.data
    };
  } catch (error) {
    console.error('Errore nell\'aggiornamento del video:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funzione per eliminare un video
export async function deleteVideo(videoId) {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    await youtube.videos.delete({
      id: videoId
    });

    return {
      success: true,
      message: 'Video eliminato con successo'
    };
  } catch (error) {
    console.error('Errore nell\'eliminazione del video:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funzione per ottenere la lista dei video del canale
export async function getChannelVideos(channelId, maxResults = 10) {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      maxResults: maxResults,
      order: 'date',
      type: 'video'
    });

    return {
      success: true,
      videos: response.data.items
    };
  } catch (error) {
    console.error('Errore nel recupero video del canale:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  uploadVideoToYouTube,
  isVideoEligibleForShorts,
  getVideoInfo,
  updateVideoMetadata,
  deleteVideo,
  getChannelVideos,
  setCredentials
};