import axios from 'axios';

// Configurazione Instagram Basic Display API
const INSTAGRAM_CONFIG = {
  CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
  CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
  REDIRECT_URI: process.env.NEXTAUTH_URL + '/api/auth/callback/instagram',
  SCOPES: ['user_profile', 'user_media'],
  BASE_URL: 'https://graph.instagram.com'
};

// Valida la configurazione di Instagram
export function validateInstagramConfig() {
  const missing = [];
  if (!INSTAGRAM_CONFIG.CLIENT_ID) missing.push('INSTAGRAM_CLIENT_ID');
  if (!INSTAGRAM_CONFIG.CLIENT_SECRET) missing.push('INSTAGRAM_CLIENT_SECRET');
  
  if (missing.length > 0) {
    throw new Error(`Missing Instagram configuration: ${missing.join(', ')}`);
  }
  
  return true;
}

// Ottieni informazioni sull'utente Instagram
export async function getInstagramUserInfo(accessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_CONFIG.BASE_URL}/me`, {
      params: {
        fields: 'id,username,account_type,media_count',
        access_token: accessToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero informazioni utente Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare le informazioni dell\'utente Instagram');
  }
}

// Ottieni i media dell'utente Instagram
export async function getInstagramUserMedia(accessToken, limit = 25) {
  try {
    const response = await axios.get(`${INSTAGRAM_CONFIG.BASE_URL}/me/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
        limit: limit,
        access_token: accessToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero media Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i media Instagram');
  }
}

// Refresh del token di accesso Instagram (se supportato)
export async function refreshInstagramAccessToken(accessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_CONFIG.BASE_URL}/refresh_access_token`, {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: accessToken
      }
    });
    
    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    };
  } catch (error) {
    console.error('Errore nel refresh del token Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile aggiornare il token di accesso Instagram');
  }
}

// Funzione per pubblicare contenuti su Instagram (nota: Instagram Basic Display API è solo per lettura)
export async function publishToInstagram(content, mediaFile, accessToken) {
  // Instagram Basic Display API non supporta la pubblicazione
  // Per pubblicare su Instagram è necessario utilizzare Instagram Graph API
  // che richiede un account business/creator collegato a una pagina Facebook
  
  throw new Error(
    'Instagram Basic Display API non supporta la pubblicazione di contenuti. ' +
    'Per pubblicare su Instagram è necessario utilizzare Instagram Graph API ' +
    'con un account business/creator collegato a una pagina Facebook.'
  );
}

export { INSTAGRAM_CONFIG };