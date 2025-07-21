import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import axios from 'axios'
import { authOptions } from '../../auth/[...nextauth]/route'
import { uploadVideoToYouTube, setCredentials, refreshAccessToken } from '../../../lib/youtube.js'
import { publishToInstagramBusiness } from '../../../lib/instagram-business.js'
import upload, { handleMulterError, cleanupTempFiles, validateVideoFile, getFileInfo } from '../../../lib/upload.js'
import fs from 'fs'
import path from 'path'

// Estendi il tipo Session per includere i token
interface ExtendedSession {
  accessToken?: string;
  refreshToken?: string;
  provider?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Funzione per pubblicare su YouTube
async function publishToYouTube(content: string, videoFile?: any, isShort: boolean = false, privacyStatus: 'public' | 'private' | 'unlisted' = 'public', session?: ExtendedSession, customTitle?: string, customDescription?: string, customTags?: string) {
  console.log('Publishing to YouTube:', {
    content: content.substring(0, 50) + '...',
    hasVideo: !!videoFile,
    isShort,
    privacyStatus,
    hasAccessToken: !!session?.accessToken,
    provider: session?.provider
  })
  console.log('Session details:', { hasAccessToken: !!session?.accessToken, hasRefreshToken: !!session?.refreshToken, provider: session?.provider });
  console.log('VideoFile details:', { hasVideoFile: !!videoFile, videoFilePath: videoFile?.path, videoFileType: videoFile?.mimetype });
  
  if (!videoFile) {
    return {
      success: false,
      error: 'YouTube richiede un file video per la pubblicazione.'
    }
  }
  
  // Verifica che l'utente sia autenticato con Google
  if (session?.provider !== 'google') {
    return {
      success: false,
      error: 'Per pubblicare su YouTube devi essere autenticato con Google.'
    }
  }
  
  // Verifica e imposta i token di accesso
  if (!session?.accessToken) {
    return {
      success: false,
      error: 'Token di accesso YouTube non disponibile. Effettua il login con Google.'
    }
  }
  
  try {
    // Imposta le credenziali per YouTube
    setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });
    
    console.log('YouTube credentials set successfully');
  } catch (credError) {
    console.error('Errore nell\'impostazione delle credenziali:', credError);
    return {
      success: false,
      error: 'Errore nell\'autenticazione YouTube: ' + (credError instanceof Error ? credError.message : 'Unknown error')
    }
  }
  
  // Funzione helper per tentare l'upload con refresh automatico del token
  const attemptUploadWithRefresh = async (uploadParams: {
    videoFile: fs.ReadStream;
    title: string;
    description: string;
    tags: string[];
    privacyStatus: 'public' | 'private' | 'unlisted';
    isShort: boolean;
  }) => {
    try {
      return await uploadVideoToYouTube(uploadParams);
    } catch (error) {
      // Se l'errore è 401 (Unauthorized), prova a rinnovare il token
      if (error.code === 401 || error.status === 401) {
        console.log('Token scaduto, tentativo di refresh...');
        
        if (!session.refreshToken) {
          throw new Error('Refresh token non disponibile. Effettua nuovamente il login.');
        }
        
        const refreshResult = await refreshAccessToken(session.refreshToken);
        if (!refreshResult.success) {
          throw new Error('Impossibile rinnovare il token: ' + refreshResult.error);
        }
        
        console.log('Token rinnovato con successo, nuovo tentativo di upload...');
        
        // Imposta le nuove credenziali
        setCredentials({
          access_token: refreshResult.accessToken,
          refresh_token: refreshResult.refreshToken
        });
        
        // Riprova l'upload con il nuovo token
        return await uploadVideoToYouTube(uploadParams);
      }
      
      // Se non è un errore 401, rilancia l'errore originale
      throw error;
    }
  };
  
  try {
    // Verifica che il file video abbia un path valido
    if (!videoFile || !videoFile.path) {
      return {
        success: false,
        error: 'File video non trovato o path non valido.'
      }
    }
    
    // Valida il file video
    const validation = validateVideoFile(videoFile)
    if (!validation.isValid) {
      return {
        success: false,
        error: `File video non valido: ${validation.errors.join(', ')}`
      }
    }
    
    // Leggi il file video
    const videoStream = fs.createReadStream(videoFile.path)
    
    // Prepara i metadati
    const title = customTitle?.trim() || content.split('\n')[0] || 'Video caricato da MultiPost'
    const description = customDescription?.trim() || content
    const tagsArray = customTags?.trim() ? customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    const defaultTags = isShort ? ['Shorts', 'MultiPost'] : ['MultiPost']
    const tags = tagsArray.length > 0 ? [...tagsArray, ...defaultTags] : defaultTags
    
    // Carica il video su YouTube con gestione automatica del refresh token
    console.log('Calling uploadVideoToYouTube with:', { title, description, tags, privacyStatus, isShort });
    const result = await attemptUploadWithRefresh({
      videoFile: videoStream,
      title: title,
      description: description,
      tags: tags,
      privacyStatus: privacyStatus,
      isShort: isShort
    })
    
    console.log('YouTube upload result:', result);
    return result
  } catch (error) {
    console.error('Errore nell\'upload su YouTube:', error)
    return {
      success: false,
      error: `Errore durante l'upload su YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function publishToInstagram(content: string, videoFile?: any, session?: ExtendedSession) {
  console.log('Publishing to Instagram:', { 
    content: content.substring(0, 50) + '...',
    hasVideo: !!videoFile,
    hasAccessToken: !!session?.accessToken,
    provider: session?.provider
  });
  
  // Verifica il tipo di autenticazione Instagram
  if (session?.provider === 'instagram-business') {
    // Usa Instagram Graph API per account business
    return await publishToInstagramBusiness(content, videoFile, session);
  } else if (session?.provider === 'instagram') {
    // Instagram Basic Display API non supporta la pubblicazione
    return {
      success: false,
      error: 'Instagram Basic Display API è solo per la lettura dei contenuti. ' +
             'Per pubblicare su Instagram, usa l\'autenticazione Instagram Business ' +
             'che supporta la pubblicazione tramite Instagram Graph API.'
    };
  } else {
    return {
      success: false,
      error: 'Per pubblicare su Instagram devi essere autenticato con Instagram Business.'
    };
  }
}

async function publishToLinkedIn(content: string, videoFile?: any) {
  console.log('Publishing to LinkedIn:', { content, hasVideo: !!videoFile });
  return {
    success: false,
    error: 'LinkedIn publishing richiede accesso alla pagina aziendale. Configura LinkedIn API.'
  };
}

async function publishToReddit(content: string, videoFile?: any) {
  console.log('Publishing to Reddit:', { content, hasVideo: !!videoFile });
  return {
    success: false,
    error: 'Reddit publishing richiede permessi subreddit. Configura Reddit API.'
  };
}

async function publishToTikTok(content: string, videoFile?: any) {
  console.log('Publishing to TikTok:', { content, hasVideo: !!videoFile });
  return {
    success: false,
    error: 'TikTok publishing richiede account business e approvazione speciale. Configura TikTok API.'
  };
}

export async function POST(request: NextRequest) {
  let tempFiles: string[] = [];
  
  try {
    let session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Gestisci FormData per i file
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const accountsData = formData.get('accounts') as string;
    const contentType = formData.get('type') as string;
    const mediaCount = parseInt(formData.get('mediaCount') as string || '0');
    const isYouTubeShort = formData.get('isYouTubeShort') === 'true';
    const youtubePrivacy = formData.get('youtubePrivacy') as 'public' | 'private' | 'unlisted' || 'public'
    const youtubeTitle = formData.get('youtubeTitle') as string || '';
    const youtubeDescription = formData.get('youtubeDescription') as string || '';
    const youtubeTags = formData.get('youtubeTags') as string || '';
    
    // Controlla se ci sono dati di sessione passati dal frontend
    const sessionDataStr = formData.get('sessionData') as string
    if (sessionDataStr && (!session.accessToken || !session.provider)) {
      try {
        const sessionData = JSON.parse(sessionDataStr)
        session = {
          ...session,
          accessToken: sessionData.accessToken,
          refreshToken: sessionData.refreshToken,
          provider: sessionData.provider
        }
        console.log('Using session data from frontend:', { 
          hasAccessToken: !!session.accessToken, 
          provider: session.provider 
        })
      } catch (e) {
        console.error('Error parsing session data:', e)
      }
    }
    
    // Parse degli account
    const accounts = JSON.parse(accountsData || '[]');
    
    console.log('Request data:', { 
      content: content?.substring(0, 50) + '...', 
      contentType, 
      accountsCount: accounts?.length, 
      mediaCount,
      isYouTubeShort,
      hasSession: !!session,
      sessionProvider: session?.provider
    })
    
    console.log('Parsed accounts:', accounts);
    console.log('Accounts details:', accounts.map((acc: any) => ({ id: acc.id, platform: acc.platform, username: acc.username })));
     
    if (!content || !accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'Contenuto e account sono richiesti' }, { status: 400 });
    }
    
    // Gestisci i file media
    let videoFile = null;
    const mediaFiles: File[] = [];
    
    // Recupera i file media dal FormData
    for (let i = 0; i < mediaCount; i++) {
      const file = formData.get(`media_${i}`) as File;
      if (file && file.size > 0) {
        mediaFiles.push(file);
      }
    }
    
    if (mediaFiles && mediaFiles.length > 0) {
      // Salva temporaneamente i file
      const uploadDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      for (const file of mediaFiles) {
        if (file && file.size > 0) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, buffer);
            
            tempFiles.push(filePath);
            
            // Per ora, usa il primo file video trovato
            if (file.type && file.type.startsWith('video/')) {
              videoFile = {
                path: filePath,
                originalname: file.name,
                mimetype: file.type,
                size: file.size
              };
            }
          } catch (fileError) {
            console.error('Errore nel salvataggio del file:', fileError);
          }
        }
      }
    }
    
    const results = [];
    
    for (const account of accounts) {
      let result;
      
      switch (account.platform) {
        case 'youtube':
          result = await publishToYouTube(content, videoFile, isYouTubeShort, youtubePrivacy, session, youtubeTitle, youtubeDescription, youtubeTags);
          break;
        case 'instagram':
          result = await publishToInstagram(content, videoFile, session);
          break;
        case 'linkedin':
          result = await publishToLinkedIn(content, videoFile);
          break;
        case 'reddit':
          result = await publishToReddit(content, videoFile);
          break;
        case 'tiktok':
          result = await publishToTikTok(content, videoFile);
          break;
        default:
          result = { success: false, error: `Piattaforma non supportata: ${account.platform}` };
      }
      
      results.push({
        platform: account.platform,
        ...result
      });
    }
    
    // Pulisci i file temporanei
    cleanupTempFiles(tempFiles);
    
    const allSuccessful = results.every(r => r.success);
    
    return NextResponse.json({
      success: allSuccessful,
      results,
      message: allSuccessful ? 'Tutti i post sono stati pubblicati con successo' : 'Alcuni post hanno avuto errori'
    });
    
  } catch (error) {
    console.error('Errore nella pubblicazione:', error);
    
    // Pulisci i file temporanei in caso di errore
    cleanupTempFiles(tempFiles);
    
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}