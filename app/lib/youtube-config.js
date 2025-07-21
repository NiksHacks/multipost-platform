// Configurazione per YouTube API
// IMPORTANTE: Aggiungi le tue credenziali OAuth2 qui

export const YOUTUBE_CONFIG = {
  // Ottieni queste credenziali da Google Cloud Console
  // https://console.cloud.google.com/
  CLIENT_ID: process.env.YOUTUBE_CLIENT_ID || 'your-client-id-here',
  CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET || 'your-client-secret-here',
  REDIRECT_URI: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
  
  // Scopes necessari per YouTube
  SCOPES: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ],
  
  // Configurazioni per l'upload
  UPLOAD_CONFIG: {
    // Dimensione massima file (2GB)
    MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024,
    
    // Formati video supportati
    SUPPORTED_FORMATS: [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ],
    
    // Configurazioni per YouTube Shorts
    SHORTS_CONFIG: {
      // Durata massima per Shorts (60 secondi)
      MAX_DURATION: 60,
      
      // Aspect ratio per Shorts (verticale)
      ASPECT_RATIO: {
        MIN: 0.5,  // 9:16 o più verticale
        MAX: 1.0   // 1:1 quadrato
      }
    }
  }
};

// Funzione per validare la configurazione
export function validateYouTubeConfig() {
  const errors = [];
  
  if (!YOUTUBE_CONFIG.CLIENT_ID || YOUTUBE_CONFIG.CLIENT_ID === 'your-client-id-here') {
    errors.push('CLIENT_ID non configurato');
  }
  
  if (!YOUTUBE_CONFIG.CLIENT_SECRET || YOUTUBE_CONFIG.CLIENT_SECRET === 'your-client-secret-here') {
    errors.push('CLIENT_SECRET non configurato');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}