# Guida al Deploy su Vercel - Stratego Multi Post

## Risoluzione Errore NEXTAUTH_URL

L'errore che stai riscontrando è dovuto al fatto che Vercel non carica automaticamente i file `.env.local` in produzione. Devi configurare le variabili d'ambiente direttamente nel Dashboard di Vercel.

## Passi per il Deploy

### 1. Configura le Variabili d'Ambiente su Vercel

Vai su [Vercel Dashboard](https://vercel.com/dashboard) → Il tuo progetto → Settings → Environment Variables

Aggiungi le seguenti variabili:

#### NextAuth (CRITICO)
```
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = generate-a-new-secret-key-here
```

#### Google/YouTube API
```
GOOGLE_CLIENT_ID = your-google-client-id-from-console
GOOGLE_CLIENT_SECRET = your-google-client-secret-from-console
YOUTUBE_CLIENT_ID = your-youtube-client-id-from-console
YOUTUBE_CLIENT_SECRET = your-youtube-client-secret-from-console
YOUTUBE_REDIRECT_URI = https://your-app-name.vercel.app/api/auth/callback/google
```

#### Instagram API
```
INSTAGRAM_CLIENT_ID = your-instagram-client-id-from-meta
INSTAGRAM_CLIENT_SECRET = your-instagram-client-secret-from-meta
INSTAGRAM_BUSINESS_CLIENT_ID = your-instagram-business-client-id
INSTAGRAM_BUSINESS_CLIENT_SECRET = your-instagram-business-client-secret
INSTAGRAM_BUSINESS_ACCESS_TOKEN = your-instagram-business-access-token
```

### 2. Aggiorna gli URL di Callback

Dopo il deploy, aggiorna gli URL di callback nelle console degli sviluppatori:

- **Google Console**: `https://your-app-name.vercel.app/api/auth/callback/google`
- **Meta Developer**: `https://your-app-name.vercel.app/api/auth/callback/instagram`

### 3. Redeploy

Dopo aver configurato le variabili d'ambiente, fai un redeploy dell'applicazione su Vercel.

## Note Importanti

- ⚠️ **NON** includere mai credenziali reali nei file di codice
- 🔑 Genera sempre un nuovo `NEXTAUTH_SECRET` per la produzione
- 🌐 Sostituisci `your-app-name` con il nome effettivo della tua app Vercel
- 📱 Testa tutte le connessioni social dopo il deploy

## Generare NEXTAUTH_SECRET

Puoi generare un nuovo secret con:
```bash
openssl rand -base64 32
```

O usa un generatore online sicuro.