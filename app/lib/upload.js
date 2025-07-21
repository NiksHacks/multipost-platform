import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurazione per il salvataggio temporaneo dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    
    // Crea la directory se non esiste
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Genera un nome file unico
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtro per i tipi di file accettati
const fileFilter = (req, file, cb) => {
  // Tipi di file video accettati
  const videoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/m4v',
    'video/3gp',
    'video/quicktime'
  ];
  
  // Tipi di file immagine accettati
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];
  
  const allAcceptedTypes = [...videoTypes, ...imageTypes];
  
  if (allAcceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo di file non supportato: ${file.mimetype}. Tipi accettati: ${allAcceptedTypes.join(', ')}`), false);
  }
};

// Configurazione multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limite per i video
    files: 10 // Massimo 10 file per upload
  }
});

// Middleware per gestire errori di multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File troppo grande. Dimensione massima: 2GB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Troppi file. Massimo 10 file per upload'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Campo file inaspettato'
        });
      default:
        return res.status(400).json({
          success: false,
          error: `Errore upload: ${error.message}`
        });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next();
};

// Funzione per pulire i file temporanei
export const cleanupTempFiles = (files) => {
  if (!files) return;
  
  const filesToClean = Array.isArray(files) ? files : [files];
  
  filesToClean.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`File temporaneo eliminato: ${file.path}`);
      } catch (error) {
        console.error(`Errore nell'eliminazione del file temporaneo ${file.path}:`, error);
      }
    }
  });
};

// Funzione per validare i file video per YouTube
export const validateVideoFile = (file) => {
  const errors = [];
  
  // Controlla il tipo di file
  const videoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/m4v',
    'video/3gp',
    'video/quicktime'
  ];
  
  if (!videoTypes.includes(file.mimetype)) {
    errors.push(`Tipo di file non supportato: ${file.mimetype}`);
  }
  
  // Controlla la dimensione (YouTube supporta fino a 256GB, ma limitiamo a 2GB per performance)
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  if (file.size > maxSize) {
    errors.push(`File troppo grande: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB. Massimo: 2GB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Funzione per ottenere informazioni sul file
export const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    sizeFormatted: formatFileSize(file.size)
  };
};

// Funzione per formattare la dimensione del file
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default upload;
export { upload };