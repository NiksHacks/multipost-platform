# MultiPost - Social Media Publishing Tool

Una applicazione Next.js per pubblicare contenuti su più piattaforme social contemporaneamente con autenticazione OAuth diretta.

## 🚀 Deploy su Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tuousername/multipost-platform)

## ✨ Caratteristiche Principali

- 🔐 **Autenticazione OAuth Diretta** - Gli utenti si autenticano direttamente con i loro account social
- 📱 **Gestione Multi-Account** - Supporta più account per piattaforma
- 🎨 **Interfaccia Moderna** - UI responsive con Tailwind CSS
- ☁️ **Deploy su Vercel** - Ottimizzato per deployment cloud
- 🔧 **TypeScript** - Codice type-safe e maintainabile

## 🌐 Piattaforme Supportate

- **YouTube** - Caricamento video e gestione canali
- **Instagram** - Post di immagini e video (via Facebook Graph API)
- **LinkedIn** - Post professionali e aziendali
- **Reddit** - Submission di post e commenti
- **TikTok** - Caricamento video (richiede approvazione business)

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 14 con App Router
- **Autenticazione**: NextAuth.js
- **Styling**: Tailwind CSS + Headless UI
- **TypeScript**: Per type safety
- **Deployment**: Vercel
- **Database**: Prisma (opzionale per persistenza)

## 📋 Requisiti

### Account Sviluppatore Necessari

#### YouTube (Google Cloud Console)
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. **Crea un nuovo progetto**:
   - Clicca "Seleziona progetto" → "Nuovo progetto"
   - Inserisci nome progetto (es. "MultiPost")
   - Clicca "Crea"
3. **Abilita YouTube Data API v3**:
   - Vai su "API e servizi" → "Libreria"
   - Cerca "YouTube Data API v3"
   - Clicca "Abilita"
4. **Crea credenziali OAuth 2.0**:
   - Vai su "API e servizi" → "Credenziali"
   - Clicca "+ CREA CREDENZIALI" → "ID client OAuth 2.0"
   - **Prima volta**: Configura schermata consenso OAuth
     - Scegli "Esterno" per test
     - Compila nome app, email utente, email sviluppatore
     - Aggiungi scope: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`
   - Seleziona "Applicazione web"
   - Nome: "MultiPost YouTube"
5. **Configura Redirect URI**:
   - **Per sviluppo locale**: `http://localhost:3000/api/auth/callback/google`
   - **Per produzione**: `https://your-domain.vercel.app/api/auth/callback/google`
6. **Salva le credenziali**:
   - Client ID: `your-google-client-id.apps.googleusercontent.com`
   - Client Secret: `your-google-client-secret`

#### Instagram (Meta for Developers)

##### 📖 **Configurazione Base - Instagram Basic Display API**
*Per collegare account Instagram personali (solo lettura)*

1. Vai su [Meta for Developers](https://developers.facebook.com/)
2. **Crea una nuova app**:
   - Clicca "Le mie app" → "Crea app"
   - Seleziona "Consumatore" per uso personale
   - Nome app: "MultiPost-IG"
   - Email di contatto: la tua email
3. **Aggiungi Instagram Basic Display**:
   - Nel dashboard app, clicca "+ Aggiungi prodotto"
   - Trova "Instagram Basic Display" → "Configura"
4. **Configura Instagram Basic Display**:
   - Vai su "Instagram Basic Display" → "Impostazioni di base"
   - **URI di reindirizzamento OAuth validi**:
     - **Per sviluppo locale**: `http://localhost:3000/api/auth/callback/instagram`
     - **Per produzione**: `https://your-domain.vercel.app/api/auth/callback/instagram`
   - **URI di cancellazione autorizzazione dati**: `http://localhost:3000/api/auth/callback/instagram`
5. **Ottieni credenziali**:
   - ID app Instagram: `your-instagram-app-id`
   - Segreto app Instagram: `your-instagram-app-secret`
6. **Aggiungi utenti di test**:
   - Vai su "Ruoli" → "Ruoli"
   - Aggiungi il tuo account Instagram come "Tester Instagram"
   - **Importante**: L'account deve accettare l'invito su Instagram

##### 🚀 **Configurazione Avanzata - Instagram Graph API**
*Per pubblicare contenuti su Instagram (account business/creator)*

**⚠️ PREREQUISITI IMPORTANTI:**
- Account Instagram Business o Creator
- Pagina Facebook collegata all'account Instagram
- App Facebook in modalità "Business" (non "Consumatore")

**STEP 1: Preparazione Account**
1. **Converti account Instagram in Business/Creator**:
   - Apri Instagram → Impostazioni → Account
   - Seleziona "Passa ad account professionale"
   - Scegli "Business" o "Creator"
   - Collega a una pagina Facebook (crea se necessario)

2. **Verifica collegamento Facebook-Instagram**:
   - Vai su [Facebook Business Manager](https://business.facebook.com/)
   - Verifica che la pagina Facebook sia collegata all'account Instagram
   - Vai su "Impostazioni" → "Account Instagram" per confermare

**STEP 2: Configurazione App Facebook**
1. **Crea nuova app Business** (o modifica esistente):
   - Vai su [Meta for Developers](https://developers.facebook.com/)
   - Clicca "Le mie app" → "Crea app"
   - **IMPORTANTE**: Seleziona "Business" (non "Consumatore")
   - Nome app: "MultiPost-IG-Business"
   - Email di contatto: la tua email

2. **Aggiungi Instagram Graph API**:
   - Nel dashboard app, clicca "+ Aggiungi prodotto"
   - Trova "Instagram Graph API" → "Configura"
   - Accetta i termini di servizio

**STEP 3: Configurazione Permessi**
1. **Configura App Review**:
   - Vai su "App Review" → "Autorizzazioni e funzionalità"
   - Richiedi i seguenti permessi:
     - `instagram_basic` (approvazione automatica)
     - `instagram_content_publish` (richiede revisione)
     - `pages_show_list` (per accedere alle pagine)
     - `pages_read_engagement` (per leggere metriche)

2. **Compila informazioni per la revisione**:
   - **Caso d'uso**: "Social media management tool for content publishing"
   - **Descrizione dettagliata**: Spiega come userai l'API per pubblicare contenuti
   - **Screenshot/Video**: Mostra l'interfaccia della tua app
   - **Privacy Policy**: URL della tua privacy policy
   - **Terms of Service**: URL dei tuoi termini di servizio

**STEP 4: Configurazione Tecnica**
1. **Impostazioni OAuth**:
   - Vai su "Instagram Graph API" → "Impostazioni di base"
   - **URI di reindirizzamento OAuth validi**:
     - `http://localhost:3000/api/auth/callback/instagram-business`
     - `https://your-domain.vercel.app/api/auth/callback/instagram-business`
   - **Webhook URL** (opzionale): Per notifiche in tempo reale

2. **Ottieni credenziali**:
   - **App ID**: Dalla dashboard principale
   - **App Secret**: Da "Impostazioni" → "Di base"
   - **Access Token**: Generato tramite Graph API Explorer

**STEP 5: Test e Implementazione**
1. **Test con Graph API Explorer**:
   - Vai su [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Seleziona la tua app
   - Testa endpoint: `/{instagram-account-id}/media`
   - Verifica permessi: `GET /me/accounts`

2. **Implementazione nel codice**:
   ```javascript
   // Esempio pubblicazione foto
   const publishPhoto = async (imageUrl, caption, accessToken, instagramAccountId) => {
     // Step 1: Crea container media
     const containerResponse = await fetch(
       `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           image_url: imageUrl,
           caption: caption,
           access_token: accessToken
         })
       }
     );
     
     const { id: creationId } = await containerResponse.json();
     
     // Step 2: Pubblica il container
     const publishResponse = await fetch(
       `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           creation_id: creationId,
           access_token: accessToken
         })
       }
     );
     
     return await publishResponse.json();
   };
   ```

**STEP 6: Variabili Environment**
```env
# Instagram Basic Display (account personali)
INSTAGRAM_CLIENT_ID=1468078987522389
INSTAGRAM_CLIENT_SECRET=4d1a01dda17283eca9626cfada3b296e

# Instagram Graph API (account business)
INSTAGRAM_BUSINESS_APP_ID=your-business-app-id
INSTAGRAM_BUSINESS_APP_SECRET=your-business-app-secret
INSTAGRAM_BUSINESS_ACCESS_TOKEN=your-long-lived-access-token
```

**📋 CHECKLIST FINALE:**
- [ ] Account Instagram convertito in Business/Creator
- [ ] Pagina Facebook collegata all'account Instagram
- [ ] App Facebook in modalità "Business"
- [ ] Instagram Graph API aggiunta all'app
- [ ] Permessi `instagram_content_publish` approvati
- [ ] URI di reindirizzamento configurati
- [ ] Access token long-lived generato
- [ ] Test con Graph API Explorer completato

**⏱️ TEMPI DI APPROVAZIONE:**
- Permessi base: Immediati
- `instagram_content_publish`: 1-7 giorni lavorativi
- App Review completa: 2-14 giorni lavorativi

**🔧 TROUBLESHOOTING COMUNE:**
- **"Invalid platform app"**: Verifica che l'app sia in modalità "Business"
- **"Permission denied"**: Controlla che i permessi siano stati approvati
- **"Invalid Instagram account"**: Verifica che l'account sia Business/Creator
- **"Token expired"**: Rigenera access token long-lived

#### LinkedIn (LinkedIn Developer Portal)
1. Vai su [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. **Crea una nuova app**:
   - Clicca "Create app"
   - Nome app: "MultiPost LinkedIn"
   - LinkedIn Page: Seleziona la tua pagina aziendale (richiesta)
   - Se non hai una pagina aziendale, creane una su LinkedIn
3. **Configura l'app**:
   - Vai su "Auth" tab
   - **Redirect URLs**:
     - **Per sviluppo locale**: `http://localhost:3000/api/auth/callback/linkedin`
     - **Per produzione**: `https://your-domain.vercel.app/api/auth/callback/linkedin`
4. **Richiedi permessi**:
   - Vai su "Products" tab
   - Richiedi accesso a "Sign In with LinkedIn"
   - Per posting: richiedi "Share on LinkedIn" (richiede revisione)
5. **Ottieni credenziali**:
   - Client ID e Client Secret nella sezione "Auth"

#### Reddit (Reddit App Preferences)
1. **Accedi a Reddit** e vai su [App Preferences](https://www.reddit.com/prefs/apps)
2. **Crea una nuova app**:
   - Clicca "Create App" o "Create Another App"
   - Nome: "MultiPost Reddit"
   - Tipo: **"web app"** (importante!)
   - Descrizione: "Social media posting tool"
3. **Configura redirect URI**:
   - **Per sviluppo locale**: `http://localhost:3000/api/auth/callback/reddit`
   - **Per produzione**: `https://your-domain.vercel.app/api/auth/callback/reddit`
4. **Ottieni credenziali**:
   - Client ID: stringa sotto il nome dell'app
   - Client Secret: "secret" mostrato dopo la creazione
5. **Note importanti**:
   - User Agent: usa formato "platform:app_name:version (by /u/username)"
   - Rispetta sempre le regole dei subreddit quando posti

#### TikTok (TikTok for Developers) ⚠️ **Avanzato**
1. Vai su [TikTok for Developers](https://developers.tiktok.com/)
2. **Registra account sviluppatore**:
   - Verifica email e numero di telefono
   - Completa il profilo sviluppatore
3. **Crea app**:
   - Nome app: "MultiPost TikTok"
   - Categoria: "Lifestyle" o "Social"
4. **Richiedi permessi speciali**:
   - **Content Posting API** richiede approvazione business
   - Processo può richiedere settimane/mesi
   - Necessario business case dettagliato
5. **Configurazione OAuth** (dopo approvazione):
   - Redirect URI: `http://localhost:3000/api/auth/callback/tiktok`
6. **⚠️ Nota**: Per ora, TikTok è disabilitato nell'app fino all'approvazione

## 🚀 Installazione e Setup

### 1. Clone del Repository
```bash
git clone <repository-url>
cd MultiPost
```

### 2. Installazione Dipendenze
```bash
npm install
```

### 3. Configurazione Environment
```bash
cp .env.example .env.local
```

## 🌐 Deploy su Vercel

### 1. Preparazione
- Assicurati che il codice sia su GitHub
- Verifica che tutte le dipendenze siano in `package.json`

### 2. Deploy
1. Vai su [vercel.com](https://vercel.com)
2. Collega il tuo repository GitHub
3. Configura le variabili d'ambiente (vedi sotto)
4. Deploy automatico!

### 3. Variabili d'Ambiente su Vercel

Configura queste variabili nel dashboard Vercel:

```env
NEXTAUTH_URL=https://tuo-progetto.vercel.app
NEXTAUTH_SECRET=il-tuo-secret-sicuro
GOOGLE_CLIENT_ID=tuo-google-client-id
GOOGLE_CLIENT_SECRET=tuo-google-client-secret
YOUTUBE_API_KEY=tua-youtube-api-key
INSTAGRAM_CLIENT_ID=tuo-instagram-client-id
INSTAGRAM_CLIENT_SECRET=tuo-instagram-client-secret
INSTAGRAM_BUSINESS_CLIENT_ID=tuo-instagram-business-client-id
INSTAGRAM_BUSINESS_CLIENT_SECRET=tuo-instagram-business-client-secret
LINKEDIN_CLIENT_ID=tuo-linkedin-client-id
LINKEDIN_CLIENT_SECRET=tuo-linkedin-client-secret
REDDIT_CLIENT_ID=tuo-reddit-client-id
REDDIT_CLIENT_SECRET=tuo-reddit-client-secret
TIKTOK_CLIENT_KEY=tuo-tiktok-client-key
TIKTOK_CLIENT_SECRET=tuo-tiktok-client-secret
```

### 4. Aggiornamento Callback URL

Dopo il deploy, aggiorna i callback URL nelle app delle piattaforme social:

#### Instagram/Facebook
- **Valid OAuth Redirect URIs**: `https://tuo-progetto.vercel.app/api/auth/callback/instagram-business`
- **Valid Deauthorize Callback URLs**: `https://tuo-progetto.vercel.app/api/auth/callback/instagram-business`

#### Google/YouTube
- **Authorized redirect URIs**: `https://tuo-progetto.vercel.app/api/auth/callback/google`

#### LinkedIn
- **Authorized redirect URLs**: `https://tuo-progetto.vercel.app/api/auth/callback/linkedin`

#### Reddit
- **Redirect URI**: `https://tuo-progetto.vercel.app/api/auth/callback/reddit`

#### TikTok
- **Redirect URI**: `https://tuo-progetto.vercel.app/api/auth/callback/tiktok`

**Compila il file `.env.local` con le tue credenziali**:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Google/YouTube API (le tue credenziali)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Instagram API (le tue credenziali)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# Altri social (da configurare)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
```

**Genera NEXTAUTH_SECRET**:
```bash
# Opzione 1: Online
# Vai su https://generate-secret.vercel.app/32

# Opzione 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opzione 3: OpenSSL
openssl rand -hex 32
```

### 4. Sviluppo Locale
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### 5. Deploy su Vercel

#### Opzione A: Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Opzione B: GitHub Integration
1. Push su GitHub
2. Connetti repository su [Vercel](https://vercel.com)
3. Configura le variabili d'ambiente nel dashboard Vercel
4. Deploy automatico

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente Richieste

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Social Media APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
# ... altri
```

### Database (Opzionale)
Per persistere le connessioni degli account:

```bash
npx prisma init
npx prisma generate
npx prisma db push
```

## 📱 Utilizzo

### Primo Avvio
1. **Avvia l'applicazione**: `npm run dev`
2. **Apri il browser**: [http://localhost:3000](http://localhost:3000)
3. **Testa le connessioni OAuth** una per volta

### Workflow Normale
1. **Connetti account**: Clicca sui pulsanti "Connect" per ogni social
2. **Autorizza l'app**: Completa il flusso OAuth su ogni piattaforma
3. **Componi contenuto**: Scrivi il tuo post e carica media se necessario
4. **Seleziona piattaforme**: Scegli dove pubblicare
5. **Pubblica**: Clicca "Publish" per inviare a tutti i social selezionati

### 🧪 Testing in Ambiente Locale

#### Configurazione per Test
- **URL base**: `http://localhost:3000` (non HTTPS)
- **Redirect URI**: Tutti configurati per localhost:3000
- **Account di test**: Usa i tuoi account personali per testare

#### Limitazioni in Modalità Test
- **Instagram**: Solo account di test aggiunti nell'app Facebook
- **LinkedIn**: Funzionalità limitate senza approvazione
- **TikTok**: Non disponibile senza approvazione business
- **YouTube**: Quota limitata per upload

#### Troubleshooting Comune

**Errore "redirect_uri_mismatch"**:
- Verifica che l'URI nel provider corrisponda esattamente
- Controlla http vs https
- Assicurati che la porta sia 3000

**Errore "invalid_client"**:
- Verifica Client ID e Secret nel file .env.local
- Controlla che non ci siano spazi extra
- Riavvia il server dopo modifiche .env

**Errore "scope not authorized"**:
- Verifica i permessi richiesti nel provider
- Per Instagram: aggiungi account come tester
- Per LinkedIn: richiedi i prodotti necessari

**Token scaduto**:
- Disconnetti e riconnetti l'account
- Alcuni provider richiedono refresh periodico

## 🔒 Sicurezza e Privacy

- **OAuth Sicuro**: Nessuna password memorizzata
- **Token Encryption**: Token di accesso crittografati
- **HTTPS Only**: Comunicazioni sicure
- **No Data Storage**: I contenuti non vengono memorizzati

## 📊 Funzionalità

- ✅ Autenticazione OAuth multi-piattaforma
- ✅ Upload media (immagini/video)
- ✅ Anteprima contenuti
- ✅ Pubblicazione simultanea
- ✅ Gestione errori avanzata
- ✅ UI responsive
- ✅ Deploy cloud-ready

## 🚧 Limitazioni Attuali

- **TikTok**: Richiede approvazione business
- **Instagram**: Solo account business/creator
- **Rate Limiting**: Rispetta i limiti API
- **File Size**: Limitazioni per upload media

## 🤝 Contributi

1. Fork del repository
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🆘 Supporto

Per problemi o domande:
- Apri un [Issue](https://github.com/your-repo/issues)
- Consulta la [Documentazione](https://github.com/your-repo/wiki)

---

**Nota**: Questa applicazione è progettata per rispettare i Terms of Service di tutte le piattaforme social integrate.