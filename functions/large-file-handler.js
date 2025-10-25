const admin = require('firebase-admin');

// Initialize Firestore (will be initialized in the main function)
let db;

// Large file upload handler (simplified - store in Firestore with chunking)
async function uploadLargeFileToStorage(fileBuffer, filename, metadata, firestoreDb) {
    try {
        console.log(`📤 Processing large file for Firestore storage: ${filename}`);
        
        // For large files, we'll store them in chunks in Firestore
        const chunkSize = 1024 * 1024; // 1MB chunks
        const chunks = [];
        
        for (let i = 0; i < fileBuffer.length; i += chunkSize) {
            const chunk = fileBuffer.slice(i, i + chunkSize);
            chunks.push(chunk.toString('base64'));
        }
        
        console.log(`📊 Split file into ${chunks.length} chunks of ${chunkSize} bytes each`);
        
        // Store chunks in Firestore
        const docRef = await firestoreDb.collection('largeFileChunks').add({
            filename: filename,
            totalChunks: chunks.length,
            chunkSize: chunkSize,
            totalSize: fileBuffer.length,
            metadata: metadata,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Store each chunk
        for (let i = 0; i < chunks.length; i++) {
            await firestoreDb.collection('largeFileChunks').doc(docRef.id).collection('chunks').doc(i.toString()).set({
                chunkIndex: i,
                data: chunks[i]
            });
        }
        
        const storageUrl = `firestore://largeFileChunks/${docRef.id}`;
        
        console.log(`✅ Large file stored in Firestore: ${storageUrl}`);
        return {
            success: true,
            storageUrl: storageUrl,
            filename: filename,
            size: fileBuffer.length,
            docId: docRef.id,
            chunks: chunks.length
        };
        
    } catch (error) {
        console.error('❌ Large file upload error:', error);
        throw error;
    }
}

// Extract images from large PDF stored in Firestore
async function extractImagesFromLargePDF(storageUrl, filename, firestoreDb) {
    try {
        console.log(`🔍 Extracting images from large PDF: ${filename}`);
        
        // Extract docId from storageUrl
        const docId = storageUrl.split('/').pop();
        
        // Reconstruct the PDF from Firestore chunks
        const fileDoc = await firestoreDb.collection('largeFileChunks').doc(docId).get();
        if (!fileDoc.exists) {
            throw new Error('Large file not found in Firestore');
        }
        
        const fileData = fileDoc.data();
        const chunks = [];
        
        // Get all chunks
        const chunksSnapshot = await firestoreDb.collection('largeFileChunks').doc(docId).collection('chunks').orderBy('chunkIndex').get();
        chunksSnapshot.forEach(doc => {
            chunks.push(doc.data().data);
        });
        
        // Reconstruct the PDF buffer
        const pdfBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk, 'base64')));
        
        console.log(`📄 PDF size: ${Math.round(pdfBuffer.length / 1024 / 1024)}MB`);
        
        const images = [];
        
        // Enhanced PDF image extraction for large files
        const pdfContent = pdfBuffer.toString('binary');
        
        // Look for various image indicators in PDF
        const imageIndicators = [
            /\/Image\s+(\d+)\s+0\s+R/g,
            /\/XObject.*\/Subtype\/Image/g,
            /\/Filter.*\/DCTDecode/g,
            /\/Width\s+(\d+).*\/Height\s+(\d+)/g,
            /\/ColorSpace.*\/DeviceRGB/g,
            /\/BitsPerComponent\s+(\d+)/g,
            /\/Length\s+(\d+)/g
        ];
        
        let hasImages = false;
        let imageCount = 0;
        
        imageIndicators.forEach((pattern, index) => {
            const matches = pdfContent.match(pattern);
            if (matches) {
                hasImages = true;
                imageCount += matches.length;
                console.log(`🔍 Found ${matches.length} image indicators (pattern ${index + 1})`);
            }
        });
        
        if (hasImages || imageCount > 0) {
            console.log(`🖼️ PDF contains images: ${imageCount} indicators found`);
        }
        
        // For large PDFs, create multiple chunks for comprehensive analysis
        const pdfSize = pdfBuffer.length;
        const chunkCount = Math.min(20, Math.max(10, Math.floor(pdfSize / (1024 * 1024)))); // 1MB chunks
        const chunkSize = Math.floor(pdfSize / chunkCount);
        
        console.log(`📄 Splitting large PDF into ${chunkCount} chunks for analysis`);
        
        for (let i = 0; i < chunkCount; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, pdfSize);
            const chunk = pdfBuffer.slice(start, end);
            
            images.push({
                buffer: chunk,
                type: 'pdf',
                filename: filename,
                pageNumber: i + 1,
                imageCount: imageCount,
                chunkIndex: i,
                chunkSize: chunk.length,
                isLargeFile: true,
                storageUrl: storageUrl
            });
        }
        
        console.log(`📊 Extracted ${images.length} chunks from large PDF: ${filename}`);
        return images;
        
    } catch (error) {
        console.error('❌ Error extracting images from large PDF:', error);
        return [];
    }
}

// Store large file metadata in Firestore
async function storeLargeFileMetadata(filename, storageUrl, metadata, firestoreDb) {
    try {
        
        const docData = {
            filename: filename,
            fileType: 'pdf',
            category: metadata.category || 'Large Owner Manuals',
            vehicleType: metadata.vehicleType || 'General',
            subcategory: 'Owner Manual',
            manualType: 'Owner Manual',
            description: `Large owner manual: ${filename}`,
            storageUrl: storageUrl,
            isLargeFile: true,
            size: metadata.size || 0,
            sizeMB: Math.round((metadata.size || 0) / 1024 / 1024),
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            // Store a small preview for quick access
            previewData: metadata.previewData || null
        };
        
        const docRef = await firestoreDb.collection('largeFiles').add(docData);
        console.log(`✅ Large file metadata stored: ${docRef.id}`);
        
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Error storing large file metadata:', error);
        throw error;
    }
}

module.exports = {
    uploadLargeFileToStorage,
    extractImagesFromLargePDF,
    storeLargeFileMetadata
};
