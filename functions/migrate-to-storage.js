const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Helper function to determine content type
function getContentType(fileType) {
    const typeMap = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'md': 'text/markdown',
        'markdown': 'text/markdown',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'xls': 'application/vnd.ms-excel'
    };
    
    return typeMap[fileType?.toLowerCase()] || 'application/octet-stream';
}

// Migration function to upload existing documents to Firebase Storage
exports.migrateDocumentsToStorage = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            console.log('🔄 Starting migration of documents to Firebase Storage...');
            
            const db = admin.firestore();
            const bucket = admin.storage().bucket('cis-de.appspot.com');
            
            // Get all documents from knowledgebase
            const snapshot = await db.collection('knowledgebase')
                .where('isActive', '==', true)
                .get();
            
            console.log(`📊 Found ${snapshot.size} documents to migrate`);
            
            let migratedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const doc of snapshot.docs) {
                const docData = doc.data();
                const docId = doc.id;
                
                try {
                    // Skip if already has downloadURL
                    if (docData.downloadURL) {
                        console.log(`⏭️ Skipping ${docData.filename} - already has downloadURL`);
                        skippedCount++;
                        continue;
                    }
                    
                    // Check if we have file data to upload
                    if (!docData.originalFileData && !docData.content) {
                        console.log(`⚠️ Skipping ${docData.filename} - no file data available`);
                        skippedCount++;
                        continue;
                    }
                    
                    // Prepare file buffer
                    let fileBuffer;
                    if (docData.originalFileData) {
                        // Use original binary data if available
                        fileBuffer = Buffer.from(docData.originalFileData, 'base64');
                    } else {
                        // Use content as fallback
                        fileBuffer = Buffer.from(docData.content, 'utf-8');
                    }
                    
                    // Upload to Firebase Storage
                    const storagePath = `knowledge-base/${Date.now()}_${docData.filename}`;
                    const file = bucket.file(storagePath);
                    
                    await file.save(fileBuffer, {
                        metadata: {
                            contentType: getContentType(docData.fileType),
                            metadata: {
                                uploadedBy: docData.uploadedBy || 'migration',
                                originalFilename: docData.filename,
                                migratedAt: new Date().toISOString()
                            }
                        }
                    });
                    
                    // Make file publicly accessible
                    await file.makePublic();
                    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
                    
                    // Update Firestore document with storage info
                    await db.collection('knowledgebase').doc(docId).update({
                        storagePath: storagePath,
                        downloadURL: downloadURL,
                        migratedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    
                    console.log(`✅ Migrated ${docData.filename} - ${downloadURL}`);
                    migratedCount++;
                    
                } catch (error) {
                    console.error(`❌ Error migrating ${docData.filename}:`, error);
                    errorCount++;
                    errors.push({
                        filename: docData.filename,
                        docId: docId,
                        error: error.message
                    });
                }
            }
            
            const result = {
                success: true,
                total: snapshot.size,
                migrated: migratedCount,
                skipped: skippedCount,
                errors: errorCount,
                errorDetails: errors
            };
            
            console.log('📊 Migration complete:', result);
            
            return res.json(result);
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Migration failed', 
                details: error.message 
            });
        }
    });
});

