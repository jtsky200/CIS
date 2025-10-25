const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugFileTypes() {
    try {
        console.log('🔍 Analyzing file types in database...');
        
        // Get all documents from both collections
        const [knowledgeBaseSnapshot, technicalSnapshot] = await Promise.all([
            db.collection('knowledgeBase').where('isActive', '==', true).get(),
            db.collection('technicalDatabase').where('isActive', '==', true).get()
        ]);

        const allDocuments = [];
        knowledgeBaseSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'knowledgeBase' }));
        technicalSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'technicalDatabase' }));

        console.log(`📊 Total documents: ${allDocuments.length}`);
        
        // Analyze file types
        const fileTypes = {};
        const imageDocuments = [];
        const pdfDocuments = [];
        
        allDocuments.forEach(doc => {
            const fileType = doc.fileType || 'unknown';
            fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
            
            if (fileType === 'image' || fileType === 'pdf') {
                if (fileType === 'image') {
                    imageDocuments.push({
                        name: doc.filename || doc.name,
                        type: fileType,
                        hasOriginalData: !!doc.originalFileData,
                        dataLength: doc.originalFileData ? doc.originalFileData.length : 0
                    });
                } else if (fileType === 'pdf') {
                    pdfDocuments.push({
                        name: doc.filename || doc.name,
                        type: fileType,
                        hasOriginalData: !!doc.originalFileData,
                        dataLength: doc.originalFileData ? doc.originalFileData.length : 0
                    });
                }
            }
        });
        
        console.log('\n📈 File Type Distribution:');
        Object.entries(fileTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} documents`);
        });
        
        console.log('\n🖼️ Image Documents:');
        imageDocuments.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.name}`);
            console.log(`      Type: ${doc.type}`);
            console.log(`      Has original data: ${doc.hasOriginalData}`);
            console.log(`      Data length: ${doc.dataLength} characters`);
        });
        
        console.log('\n📄 PDF Documents (first 10):');
        pdfDocuments.slice(0, 10).forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.name}`);
            console.log(`      Type: ${doc.type}`);
            console.log(`      Has original data: ${doc.hasOriginalData}`);
            console.log(`      Data length: ${doc.dataLength} characters`);
        });
        
        if (pdfDocuments.length > 10) {
            console.log(`   ... and ${pdfDocuments.length - 10} more PDF documents`);
        }
        
        console.log('\n🔍 Analysis Summary:');
        console.log(`   Total documents: ${allDocuments.length}`);
        console.log(`   Image documents: ${imageDocuments.length}`);
        console.log(`   PDF documents: ${pdfDocuments.length}`);
        console.log(`   Other documents: ${allDocuments.length - imageDocuments.length - pdfDocuments.length}`);
        
        // Check if PDFs have original data for image extraction
        const pdfsWithData = pdfDocuments.filter(doc => doc.hasOriginalData && doc.dataLength > 1000);
        console.log(`   PDFs with substantial data: ${pdfsWithData.length}`);
        
        if (pdfsWithData.length > 0) {
            console.log('\n📊 PDFs with data (first 5):');
            pdfsWithData.slice(0, 5).forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.name} (${doc.dataLength} chars)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

debugFileTypes();
