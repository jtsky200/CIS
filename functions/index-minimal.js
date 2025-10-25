const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

// Load environment variables
require('dotenv').config();

admin.initializeApp();

const db = admin.firestore();
db.settings({
    ignoreUndefinedProperties: true
});

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

// ============================================================================
// CHAT ENDPOINT - OpenAI Assistants API
// ============================================================================

exports.chat = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { message, threadId } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            if (!ASSISTANT_ID) {
                return res.status(500).json({ error: 'Assistant ID not configured' });
            }

            let currentThreadId = threadId;

            // Create new thread if none provided
            if (!currentThreadId) {
                const thread = await openai.beta.threads.create();
                currentThreadId = thread.id;
            }

            // Add user message to thread
            await openai.beta.threads.messages.create(currentThreadId, {
                role: 'user',
                content: message
            });

            // Run the assistant
            const run = await openai.beta.threads.runs.create(currentThreadId, {
                assistant_id: ASSISTANT_ID
            });

            // Poll for completion
            let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
            let attempts = 0;
            const maxAttempts = 60; // 60 seconds max

            while (runStatus.status !== 'completed' && attempts < maxAttempts) {
                if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
                    throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
                attempts++;
            }

            if (runStatus.status !== 'completed') {
                throw new Error('Assistant response timeout');
            }

            // Get messages
            const messages = await openai.beta.threads.messages.list(currentThreadId);
            const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');

            if (assistantMessages.length === 0) {
                throw new Error('No response from assistant');
            }

            // Get the latest assistant message
            const latestMessage = assistantMessages[0];
            let responseText = '';

            // Extract text from message content
            for (const content of latestMessage.content) {
                if (content.type === 'text') {
                    responseText += content.text.value;
                }
            }

            res.json({ 
                response: responseText,
                threadId: currentThreadId,
                messageId: latestMessage.id
            });

        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    });
});

// ============================================================================
// TECHNICAL DATABASE ENDPOINTS
// ============================================================================

// Get all technical documents
exports.technicalDatabase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { docId } = req.query;
            
            if (docId) {
                // Get specific document
                const docRef = db.collection('technicalDatabase').doc(docId);
                const doc = await docRef.get();
                
                if (!doc.exists) {
                    return res.status(404).json({ error: 'Document not found' });
                }
                
                return res.json({
                    id: doc.id,
                    ...doc.data()
                });
            } else {
                // Get all documents
                const snapshot = await db.collection('technicalDatabase').orderBy('uploadedAt', 'desc').get();
                const documents = [];
                
                snapshot.forEach(doc => {
                    documents.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                return res.json({ documents });
            }
        } catch (error) {
            console.error('Error fetching technical documents:', error);
            return res.status(500).json({ error: 'Failed to fetch technical documents' });
        }
    });
});

// Upload technical document
exports.uploadTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { 
                filename, 
                content, 
                fileType, 
                category, 
                subcategory, 
                description,
                originalFileData 
            } = req.body;

            if (!filename || !content) {
                return res.status(400).json({ error: 'Filename and content are required' });
            }

            // Generate unique document ID
            const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Prepare document data
            const docData = {
                filename,
                content,
                fileType: fileType || 'TXT',
                category: category || 'General',
                subcategory: subcategory || 'Uncategorized',
                description: description || '',
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                originalFileData: originalFileData || null,
                fileSize: content.length,
                isActive: true
            };

            // Save to Firestore
            await db.collection('technicalDatabase').doc(docId).set(docData);

            console.log(`Technical document uploaded: ${filename} (${docId})`);

            return res.json({
                success: true,
                documentId: docId,
                message: 'Technical document uploaded successfully'
            });

        } catch (error) {
            console.error('Error uploading technical document:', error);
            return res.status(500).json({ error: 'Failed to upload technical document' });
        }
    });
});

// Update technical document
exports.updateTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { docId } = req.query;
            const updateData = req.body;

            if (!docId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Add last updated timestamp
            updateData.lastUpdated = admin.firestore.FieldValue.serverTimestamp();

            // Update document
            await db.collection('technicalDatabase').doc(docId).update(updateData);

            console.log(`Technical document updated: ${docId}`);

            return res.json({
                success: true,
                message: 'Technical document updated successfully'
            });

        } catch (error) {
            console.error('Error updating technical document:', error);
            return res.status(500).json({ error: 'Failed to update technical document' });
        }
    });
});

// Delete technical document
exports.deleteTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'DELETE') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { docId } = req.query;

            if (!docId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Delete document
            await db.collection('technicalDatabase').doc(docId).delete();

            console.log(`Technical document deleted: ${docId}`);

            return res.json({
                success: true,
                message: 'Technical document deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting technical document:', error);
            return res.status(500).json({ error: 'Failed to delete technical document' });
        }
    });
});

// Search technical documents
exports.searchTechnicalDatabase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { query, category, subcategory, fileType } = req.query;

            let queryRef = db.collection('technicalDatabase').where('isActive', '==', true);

            // Apply filters
            if (category) {
                queryRef = queryRef.where('category', '==', category);
            }
            if (subcategory) {
                queryRef = queryRef.where('subcategory', '==', subcategory);
            }
