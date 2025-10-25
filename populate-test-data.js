const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function populateTestData() {
    console.log('🚀 Starting to populate test data...');
    
    try {
        // Add test knowledge base documents
        const knowledgeDocs = [
            {
                filename: 'Cadillac Lyriq Manual 2024.pdf',
                content: 'Cadillac Lyriq 2024 Owner Manual - Complete guide for European market',
                fileType: 'pdf',
                uploadedAt: new Date(),
                size: 1024000,
                isActive: true,
                description: 'Official Cadillac Lyriq owner manual for 2024 model year'
            },
            {
                filename: 'Charging Guide EU.pdf',
                content: 'Complete charging guide for Cadillac EVs in Europe',
                fileType: 'pdf',
                uploadedAt: new Date(),
                size: 512000,
                isActive: true,
                description: 'Charging instructions and tips for European charging infrastructure'
            },
            {
                filename: 'Troubleshooting Guide.txt',
                content: 'Common issues and solutions for Cadillac EV vehicles',
                fileType: 'txt',
                uploadedAt: new Date(),
                size: 256000,
                isActive: true,
                description: 'Troubleshooting guide for common Cadillac EV problems'
            }
        ];
        
        console.log('📚 Adding knowledge base documents...');
        for (const doc of knowledgeDocs) {
            await db.collection('knowledgebase').add(doc);
            console.log('✅ Added:', doc.filename);
        }
        
        // Add test technical database documents
        const technicalDocs = [
            {
                filename: 'Engine Specifications.pdf',
                content: 'Detailed engine specifications for Cadillac EV powertrain',
                fileType: 'pdf',
                category: 'Powertrain',
                subcategory: 'Electric Motor',
                vehicleType: 'Lyriq',
                uploadedAt: new Date(),
                size: 768000,
                isActive: true,
                description: 'Technical specifications for electric motor system'
            },
            {
                filename: 'Battery System Manual.pdf',
                content: 'Battery management system and charging protocols',
                fileType: 'pdf',
                category: 'Battery',
                subcategory: 'Management System',
                vehicleType: 'Lyriq',
                uploadedAt: new Date(),
                size: 1536000,
                isActive: true,
                description: 'Battery system technical documentation'
            },
            {
                filename: 'Infotainment System.pdf',
                content: 'Infotainment system technical specifications and troubleshooting',
                fileType: 'pdf',
                category: 'Electronics',
                subcategory: 'Infotainment',
                vehicleType: 'Lyriq',
                uploadedAt: new Date(),
                size: 640000,
                isActive: true,
                description: 'Infotainment system technical guide'
            }
        ];
        
        console.log('🔧 Adding technical database documents...');
        for (const doc of technicalDocs) {
            await db.collection('technicalDatabase').add(doc);
            console.log('✅ Added:', doc.filename);
        }
        
        console.log('🎉 Test data population completed successfully!');
        
    } catch (error) {
        console.error('❌ Error populating test data:', error);
    } finally {
        process.exit(0);
    }
}

populateTestData();
