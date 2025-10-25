const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Manual directory
const MANUALS_DIR = path.join(__dirname, '..', 'manuals technical');

// Vehicle type detection from filename or content
function detectVehicleType(filename, content = '') {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  if (lowerFilename.includes('lyriq') || lowerContent.includes('lyriq')) return 'LYRIQ';
  if (lowerFilename.includes('vistiq') || lowerContent.includes('vistiq')) return 'VISTIQ';
  if (lowerFilename.includes('optiq') || lowerContent.includes('optiq')) return 'OPTIQ';
  if (lowerFilename.includes('escalade') || lowerContent.includes('escalade')) return 'ESCALADE';
  if (lowerFilename.includes('celestiq') || lowerContent.includes('celestiq')) return 'CELESTIQ';
  return 'GENERAL';
}

// Manual type detection
function detectManualType(filename, content = '') {
  const lower = filename.toLowerCase() + ' ' + content.toLowerCase();
  
  if (lower.includes('owner') || lower.includes('user')) return 'USER_MANUAL';
  if (lower.includes('service') || lower.includes('maintenance')) return 'SERVICE_MANUAL';
  if (lower.includes('troubleshoot')) return 'TROUBLESHOOTING';
  if (lower.includes('quick') || lower.includes('start')) return 'QUICK_START';
  if (lower.includes('warranty')) return 'WARRANTY';
  if (lower.includes('safety') || lower.includes('emergency')) return 'SAFETY';
  if (lower.includes('faq')) return 'FAQ';
  if (lower.includes('specification')) return 'SPECIFICATIONS';
  if (lower.includes('charging')) return 'CHARGING';
  if (lower.includes('infotainment')) return 'INFOTAINMENT';
  if (lower.includes('warning')) return 'WARNING_SYMBOLS';
  return 'GENERAL';
}

// File type detection
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (ext === '.txt' || ext === '.md') return 'TXT';
  if (ext === '.docx') return 'DOCX';
  if (ext === '.xlsx') return 'XLSX';
  if (ext === '.jpeg' || ext === '.jpg') return 'IMAGE';
  return 'UNKNOWN';
}

// Read file content
async function readFileContent(filePath, fileType) {
  try {
    if (fileType === 'PDF') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } else if (fileType === 'TXT') {
      return fs.readFileSync(filePath, 'utf8');
    } else if (fileType === 'IMAGE') {
      // For images, return base64
      const imageBuffer = fs.readFileSync(filePath);
      return imageBuffer.toString('base64');
    } else {
      // For other types, store file info only
      return `File: ${path.basename(filePath)}`;
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return '';
  }
}

// Upload to Firestore
async function uploadToDatabase(collection, docData) {
  try {
    const docRef = await db.collection(collection).add(docData);
    console.log(`✅ Uploaded to ${collection}: ${docData.filename} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Error uploading to ${collection}:`, error.message);
    return null;
  }
}

// Process single file
async function processFile(filePath, vehicleFolder) {
  const filename = path.basename(filePath);
  const fileType = detectFileType(filename);
  
  console.log(`\n📄 Processing: ${filename}`);
  console.log(`   Type: ${fileType}`);
  
  // Skip non-document files
  if (fileType === 'UNKNOWN') {
    console.log(`   ⚠️ Skipping unsupported file type`);
    return;
  }
  
  // Read file stats
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  
  // Skip very large files (>50MB)
  if (fileSize > 50 * 1024 * 1024) {
    console.log(`   ⚠️ Skipping: File too large (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
    return;
  }
  
  // Read file content
  const content = await readFileContent(filePath, fileType);
  const contentPreview = content.substring(0, 500);
  
  // Detect vehicle and manual type
  const vehicleType = vehicleFolder || detectVehicleType(filename, contentPreview);
  const manualType = detectManualType(filename, contentPreview);
  
  console.log(`   Vehicle: ${vehicleType}`);
  console.log(`   Manual Type: ${manualType}`);
  console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
  
  // Create document data
  const timestamp = admin.firestore.Timestamp.now();
  const docData = {
    filename: filename,
    name: filename.replace(/\.[^/.]+$/, ''), // Remove extension
    fileType: fileType,
    type: fileType,
    vehicleType: vehicleType,
    manualType: manualType,
    category: manualType,
    content: content,
    size: fileSize,
    uploadedAt: timestamp,
    createdAt: timestamp,
    isActive: true,
    source: 'manual_upload',
    description: `${vehicleType} ${manualType} - ${filename}`
  };
  
  // Upload to both Knowledge Base and Technical Database
  console.log(`   📤 Uploading to databases...`);
  
  const kbId = await uploadToDatabase('knowledgeBase', docData);
  const techId = await uploadToDatabase('technicalDatabase', docData);
  
  if (kbId && techId) {
    console.log(`   ✅ Successfully uploaded to both databases`);
    return { kbId, techId };
  } else {
    console.log(`   ⚠️ Partial upload (check errors above)`);
    return null;
  }
}

// Process directory recursively
async function processDirectory(dirPath, vehicleFolder = '') {
  const items = fs.readdirSync(dirPath);
  const results = {
    processed: 0,
    uploaded: 0,
    skipped: 0,
    errors: 0
  };
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Skip README and hidden directories
      if (item === 'README.md' || item.startsWith('.')) continue;
      
      console.log(`\n📁 Processing folder: ${item}`);
      const subResults = await processDirectory(itemPath, item);
      results.processed += subResults.processed;
      results.uploaded += subResults.uploaded;
      results.skipped += subResults.skipped;
      results.errors += subResults.errors;
    } else if (stats.isFile()) {
      // Skip README files
      if (item === 'README.md') continue;
      
      results.processed++;
      
      try {
        const uploadResult = await processFile(itemPath, vehicleFolder);
        if (uploadResult) {
          results.uploaded++;
        } else {
          results.errors++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${item}:`, error.message);
        results.errors++;
      }
    }
  }
  
  return results;
}

// Main function
async function main() {
  console.log('🚀 Starting manual upload to Knowledge Base and Technical Database...\n');
  console.log(`📂 Source directory: ${MANUALS_DIR}\n`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (!fs.existsSync(MANUALS_DIR)) {
    console.error(`❌ Directory not found: ${MANUALS_DIR}`);
    process.exit(1);
  }
  
  try {
    const results = await processDirectory(MANUALS_DIR);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('\n📊 UPLOAD SUMMARY:');
    console.log(`   📄 Files processed: ${results.processed}`);
    console.log(`   ✅ Successfully uploaded: ${results.uploaded}`);
    console.log(`   ⚠️ Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors}`);
    console.log('\n✨ Upload complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check Firestore console to verify uploads');
    console.log('   2. Test the AI chat with vehicle-specific questions');
    console.log('   3. Try troubleshooting with image upload');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
main();

