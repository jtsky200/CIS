const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPDFs() {
  try {
    console.log('🔍 Checking technical database documents...');
    const snapshot = await db.collection('technicalDatabase').limit(3).get();
    
    if (snapshot.empty) {
      console.log('❌ No documents found in technicalDatabase');
      return;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄 Document ID:', doc.id);
      console.log('📄 Filename:', data.filename || data.name);
      console.log('📄 File Type:', data.fileType || data.type);
      console.log('📄 Content Length:', data.content ? data.content.length : 'No content');
      console.log('📄 Original File Data Length:', data.originalFileData ? data.originalFileData.length : 'No original data');
      
      if (data.content) {
        // Check if content starts with valid base64
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isValidBase64 = base64Regex.test(data.content);
        console.log('📄 Is Valid Base64:', isValidBase64);
        
        // Check what format it actually is
        console.log('📄 Content Preview (first 50 chars):', data.content.substring(0, 50));
        
        // Try different decoding methods
        try {
          // Try base64 first
          const decodedBase64 = Buffer.from(data.content, 'base64');
          const isPDFBase64 = decodedBase64.toString('ascii', 0, 4) === '%PDF';
          console.log('📄 Base64 -> PDF:', isPDFBase64);
          if (isPDFBase64) {
            console.log('📄 Base64 PDF Header:', decodedBase64.toString('ascii', 0, 20));
          }
        } catch (e) {
          console.log('📄 Base64 Decode Error:', e.message);
        }
        
        try {
          // Try URL decoding
          const urlDecoded = decodeURIComponent(data.content);
          const decodedUrl = Buffer.from(urlDecoded, 'base64');
          const isPDFUrl = decodedUrl.toString('ascii', 0, 4) === '%PDF';
          console.log('📄 URL Decoded -> PDF:', isPDFUrl);
          if (isPDFUrl) {
            console.log('📄 URL PDF Header:', decodedUrl.toString('ascii', 0, 20));
          }
        } catch (e) {
          console.log('📄 URL Decode Error:', e.message);
        }
        
        // Check if it's already binary data
        const isBinary = data.content.includes('%PDF');
        console.log('📄 Contains %PDF directly:', isBinary);
      }
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPDFs();
