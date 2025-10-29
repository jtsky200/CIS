const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Cadillac official image URLs (placeholder - these should be actual Cadillac images)
const images = {
    lyriq: [
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/2024-lyriq/mov/01-images/2024-lyriq-exterior-design-gallery-01.jpg',
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/2024-lyriq/mov/01-images/2024-lyriq-exterior-design-gallery-02.jpg',
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/2024-lyriq/mov/01-images/2024-lyriq-interior-design-gallery-01.jpg'
    ],
    lyriqv: [
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/lyriq-v/movFallback/fallback/lyriq-v-placeholder.jpg'
    ],
    vistiq: [
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/vistiq/mov/01-images/vistiq-exterior-01.jpg',
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/vistiq/mov/01-images/vistiq-interior-01.jpg'
    ],
    optiq: [
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/optiq/mov/01-images/optiq-exterior-01.jpg',
        'https://www.cadillaceurope.com/content/dam/cadillac/eu/master/english/index/vehicles/optiq/mov/01-images/optiq-interior-01.jpg'
    ]
};

async function addImagesToDocuments() {
    try {
        console.log('📸 Adding images to Knowledge Base documents...\n');
        
        // Get all KB documents
        const snapshot = await db.collection('knowledgeBase').get();
        
        let updated = 0;
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const title = (data.title || '').toLowerCase();
            
            let imagesToAdd = [];
            
            // Check which model this document is about
            if (title.includes('lyriq-v')) {
                imagesToAdd = images.lyriqv;
            } else if (title.includes('lyriq')) {
                imagesToAdd = images.lyriq;
            } else if (title.includes('vistiq')) {
                imagesToAdd = images.vistiq;
            } else if (title.includes('optiq')) {
                imagesToAdd = images.optiq;
            } else if (title.includes('lineup') || title.includes('modelle')) {
                // For overview pages, add one image of each model
                imagesToAdd = [
                    images.optiq[0],
                    images.lyriq[0],
                    images.vistiq[0],
                    images.lyriqv[0]
                ];
            }
            
            if (imagesToAdd.length > 0) {
                await doc.ref.update({
                    images: imagesToAdd,
                    lastUpdated: new Date().toISOString()
                });
                
                console.log('✅ Added', imagesToAdd.length, 'images to:', data.title);
                updated++;
            }
        }
        
        console.log('\n✅ Successfully added images to', updated, 'documents!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

addImagesToDocuments();

