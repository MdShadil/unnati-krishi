const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directories exist
const createUploadDirs = async () => {
  const dirs = [
    './uploads',
    './uploads/crops',
    './uploads/avatars',
    './uploads/receipts',
    './uploads/temp'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// Initialize upload directories
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/temp';
    
    // Determine upload path based on file type or route
    if (file.fieldname === 'avatar') {
      uploadPath = './uploads/avatars';
    } else if (file.fieldname === 'cropImage') {
      uploadPath = './uploads/crops';
    } else if (file.fieldname === 'receipt') {
      uploadPath = './uploads/receipts';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: ['application/pdf', 'image/jpeg', 'image/png']
  };
  
  let allowed = false;
  
  if (file.fieldname === 'avatar' || file.fieldname === 'cropImage') {
    allowed = allowedTypes.image.includes(file.mimetype);
  } else if (file.fieldname === 'receipt') {
    allowed = [...allowedTypes.image, ...allowedTypes.document].includes(file.mimetype);
  }
  
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.image.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per upload
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const { file } = req;
    const inputPath = file.path;
    const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
    
    // Process image based on type
    let processedImage;
    
    if (file.fieldname === 'avatar') {
      // Resize avatar to 200x200
      processedImage = await sharp(inputPath)
        .resize(200, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } else if (file.fieldname === 'cropImage') {
      // Resize crop image while maintaining aspect ratio
      const metadata = await sharp(inputPath).metadata();
      const maxWidth = 1200;
      const maxHeight = 1200;
      
      let width = metadata.width;
      let height = metadata.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      processedImage = await sharp(inputPath)
        .resize(width, height)
        .webp({ quality: 85 })
        .toFile(outputPath);
    } else {
      // Default processing
      processedImage = await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
    
    // Delete original file
    await fs.unlink(inputPath);
    
    // Update file object
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath);
    req.file.size = processedImage.size;
    req.file.mimetype = 'image/webp';
    
    next();
  } catch (error) {
    next(error);
  }
};

// Multiple image processing
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  
  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const inputPath = file.path;
      const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
      
      const processedImage = await sharp(inputPath)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      // Delete original file
      await fs.unlink(inputPath);
      
      // Update file object
      req.files[i].path = outputPath;
      req.files[i].filename = path.basename(outputPath);
      req.files[i].size = processedImage.size;
      req.files[i].mimetype = 'image/webp';
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Cleanup temp files on error
const cleanupOnError = (error, req, res, next) => {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path).catch(console.error);
  }
  
  if (req.files) {
    req.files.forEach(file => {
      if (file.path) {
        fs.unlink(file.path).catch(console.error);
      }
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  processImage,
  processImages,
  cleanupOnError,
  createUploadDirs
};