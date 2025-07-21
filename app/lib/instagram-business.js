import axios from 'axios';

// Configurazione Instagram Graph API (Business/Creator)
const INSTAGRAM_BUSINESS_CONFIG = {
  CLIENT_ID: process.env.INSTAGRAM_BUSINESS_CLIENT_ID,
  CLIENT_SECRET: process.env.INSTAGRAM_BUSINESS_CLIENT_SECRET,
  ACCESS_TOKEN: process.env.INSTAGRAM_BUSINESS_ACCESS_TOKEN,
  REDIRECT_URI: process.env.NEXTAUTH_URL + '/api/auth/callback/instagram-business',
  SCOPES: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
  GRAPH_API_URL: 'https://graph.facebook.com',
  INSTAGRAM_API_URL: 'https://graph.instagram.com'
};

// Valida la configurazione di Instagram Business
export function validateInstagramBusinessConfig() {
  const missing = [];
  if (!INSTAGRAM_BUSINESS_CONFIG.CLIENT_ID) missing.push('INSTAGRAM_BUSINESS_CLIENT_ID');
  if (!INSTAGRAM_BUSINESS_CONFIG.CLIENT_SECRET) missing.push('INSTAGRAM_BUSINESS_CLIENT_SECRET');
  
  if (missing.length > 0) {
    throw new Error(`Missing Instagram Business configuration: ${missing.join(', ')}`);
  }
  
  return true;
}

// Ottieni le pagine Facebook collegate all'account
export async function getFacebookPages(accessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/me/accounts`, {
      params: {
        access_token: accessToken
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Errore nel recupero pagine Facebook:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare le pagine Facebook');
  }
}

// Ottieni l'account Instagram Business collegato a una pagina Facebook
export async function getInstagramBusinessAccount(pageId, pageAccessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: pageAccessToken
      }
    });
    
    return response.data.instagram_business_account;
  } catch (error) {
    console.error('Errore nel recupero account Instagram Business:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare l\'account Instagram Business');
  }
}

// Ottieni informazioni sull'account Instagram Business
export async function getInstagramBusinessInfo(instagramAccountId, accessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${instagramAccountId}`, {
      params: {
        fields: 'id,username,name,profile_picture_url,followers_count,media_count',
        access_token: accessToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero informazioni Instagram Business:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare le informazioni dell\'account Instagram Business');
  }
}

// Carica un'immagine su Instagram (Fase 1: Creazione container)
export async function createInstagramImageContainer(instagramAccountId, imageUrl, caption, accessToken) {
  try {
    const response = await axios.post(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${instagramAccountId}/media`, {
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken
    });
    
    return response.data.id; // Restituisce l'ID del container
  } catch (error) {
    console.error('Errore nella creazione container immagine Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile creare il container per l\'immagine Instagram');
  }
}

// Carica un video su Instagram (Fase 1: Creazione container)
export async function createInstagramVideoContainer(instagramAccountId, videoUrl, caption, accessToken) {
  try {
    const response = await axios.post(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${instagramAccountId}/media`, {
      media_type: 'VIDEO',
      video_url: videoUrl,
      caption: caption,
      access_token: accessToken
    });
    
    return response.data.id; // Restituisce l'ID del container
  } catch (error) {
    console.error('Errore nella creazione container video Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile creare il container per il video Instagram');
  }
}

// Pubblica il contenuto su Instagram (Fase 2: Pubblicazione)
export async function publishInstagramMedia(instagramAccountId, creationId, accessToken) {
  try {
    const response = await axios.post(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${instagramAccountId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken
    });
    
    return response.data.id; // Restituisce l'ID del post pubblicato
  } catch (error) {
    console.error('Errore nella pubblicazione su Instagram:', error.response?.data || error.message);
    throw new Error('Impossibile pubblicare il contenuto su Instagram');
  }
}

// Controlla lo stato di un container media
export async function checkMediaContainerStatus(containerId, accessToken) {
  try {
    const response = await axios.get(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${containerId}`, {
      params: {
        fields: 'status_code,status',
        access_token: accessToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nel controllo stato container:', error.response?.data || error.message);
    throw new Error('Impossibile controllare lo stato del container');
  }
}

// Funzione principale per pubblicare su Instagram Business
export async function publishToInstagramBusiness(content, mediaFile, session) {
  try {
    // Verifica autenticazione
    if (!session || session.provider !== 'instagram-business') {
      throw new Error('Utente non autenticato con Instagram Business');
    }
    
    const accessToken = session.accessToken;
    
    // 1. Ottieni le pagine Facebook
    const pages = await getFacebookPages(accessToken);
    if (!pages || pages.length === 0) {
      throw new Error('Nessuna pagina Facebook trovata');
    }
    
    // 2. Ottieni l'account Instagram Business dalla prima pagina
    const firstPage = pages[0];
    const instagramAccount = await getInstagramBusinessAccount(firstPage.id, firstPage.access_token);
    
    if (!instagramAccount) {
      throw new Error('Nessun account Instagram Business collegato alla pagina Facebook');
    }
    
    // 3. Determina il tipo di media e crea il container
    let containerId;
    const mediaType = mediaFile.type;
    
    if (mediaType.startsWith('image/')) {
      // Per le immagini, dovresti prima caricare l'immagine su un server pubblico
      // Qui assumiamo che mediaFile.url sia l'URL pubblico dell'immagine
      containerId = await createInstagramImageContainer(
        instagramAccount.id,
        mediaFile.url, // URL pubblico dell'immagine
        content,
        firstPage.access_token
      );
    } else if (mediaType.startsWith('video/')) {
      // Per i video, dovresti prima caricare il video su un server pubblico
      containerId = await createInstagramVideoContainer(
        instagramAccount.id,
        mediaFile.url, // URL pubblico del video
        content,
        firstPage.access_token
      );
    } else {
      throw new Error('Tipo di media non supportato. Supportati: immagini e video');
    }
    
    // 4. Attendi che il container sia pronto (per i video può richiedere tempo)
    let attempts = 0;
    const maxAttempts = 10;
    let containerStatus;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendi 2 secondi
      containerStatus = await checkMediaContainerStatus(containerId, firstPage.access_token);
      attempts++;
    } while (containerStatus.status_code !== 'FINISHED' && attempts < maxAttempts);
    
    if (containerStatus.status_code !== 'FINISHED') {
      throw new Error('Il container media non è pronto per la pubblicazione');
    }
    
    // 5. Pubblica il contenuto
    const postId = await publishInstagramMedia(
      instagramAccount.id,
      containerId,
      firstPage.access_token
    );
    
    return {
      success: true,
      postId: postId,
      platform: 'instagram-business',
      message: 'Contenuto pubblicato con successo su Instagram Business'
    };
    
  } catch (error) {
    console.error('Errore nella pubblicazione Instagram Business:', error.message);
    return {
      success: false,
      error: error.message,
      platform: 'instagram-business'
    };
  }
}

// Ottieni i media dell'account Instagram Business
export async function getInstagramBusinessMedia(instagramAccountId, accessToken, limit = 25) {
  try {
    const response = await axios.get(`${INSTAGRAM_BUSINESS_CONFIG.GRAPH_API_URL}/${instagramAccountId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        limit: limit,
        access_token: accessToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero media Instagram Business:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i media Instagram Business');
  }
}

export { INSTAGRAM_BUSINESS_CONFIG };