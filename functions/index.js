const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { migrateDocumentsToStorage } = require('./migrate-to-storage');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const vision = require('@google-cloud/vision');
const { uploadLargeFileToStorage, extractImagesFromLargePDF, storeLargeFileMetadata } = require('./large-file-handler');

// Load environment variables
require('dotenv').config();

admin.initializeApp();

const db = admin.firestore();
db.settings({
    ignoreUndefinedProperties: true
});

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || functions.config().openai.key
});

// Initialize Google Cloud Vision API
const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: 'serviceAccountKey.json'
});

// Gemini API configuration
const GEMINI_API_KEY = 'AQ.Ab8RN6KkXwnlhzzq3RFFIy3B7WDUQNGViqQS90hLWb03LK00Fw';
const GEMINI_API_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent';

const ASSISTANT_ID = 'asst_eGNzwjgQQU0sS2S6IDcnW4u6';
// Let's try to find the correct Vector Store ID
const VECTOR_STORE_ID = 'vs_68eab380f2888191a232d2caa815abcb';

// Debug function to check Vector Store
async function debugVectorStore() {
    try {
        console.log('🔍 Debugging Vector Store...');
        console.log('Vector Store ID:', VECTOR_STORE_ID);
        
        // List all vector stores
        const vectorStores = await openai.beta.vectorStores.list();
        console.log('Available Vector Stores:', vectorStores.data.map(vs => ({ id: vs.id, name: vs.name, status: vs.status })));
        
        // Check if our vector store exists
        const ourVectorStore = vectorStores.data.find(vs => vs.id === VECTOR_STORE_ID);
        if (ourVectorStore) {
            console.log('✅ Our Vector Store found:', ourVectorStore.name, 'Status:', ourVectorStore.status);
            
            // List files in our vector store
            const files = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
            console.log('Files in Vector Store:', files.data.map(f => ({ id: f.id, metadata: f.metadata, status: f.status })));
        } else {
            console.log('❌ Our Vector Store not found!');
            console.log('🔍 Trying to find a suitable Vector Store...');
            
            // Look for any active vector store
            const activeVectorStore = vectorStores.data.find(vs => vs.status === 'active');
            if (activeVectorStore) {
                console.log('✅ Found active Vector Store:', activeVectorStore.id, activeVectorStore.name);
                return activeVectorStore.id;
            } else {
                console.log('❌ No active Vector Store found!');
            }
        }
        
        // Also check the assistant
        console.log('🔍 Checking Assistant...');
        const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
        console.log('Assistant:', assistant.name, 'Model:', assistant.model);
        console.log('Assistant tools:', assistant.tools);
        console.log('Assistant tool_resources:', assistant.tool_resources);
        
    } catch (error) {
        console.error('❌ Debug Vector Store error:', error);
    }
}

// ============================================================================
// VECTOR STORE SYNCHRONIZATION
// ============================================================================

async function syncVectorStore() {
    try {
        console.log('🔄 Starting Vector Store synchronization...');
        
        // Get all active documents from knowledgebase
        const snapshot = await db.collection('knowledgebase')
            .where('isActive', '==', true)
            .get();
        
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📚 Found ${documents.length} documents to sync`);
        
        // Get current files in vector store
        let vectorStoreFiles = { data: [] };
        try {
            vectorStoreFiles = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
            console.log(`📁 Current vector store has ${vectorStoreFiles.data.length} files`);
        } catch (error) {
            console.log('⚠️ Could not list existing vector store files, proceeding with upload:', error.message);
        }
        
        // Upload new documents to vector store
        for (const doc of documents) {
            try {
                // Check if file already exists in vector store
                const existingFile = vectorStoreFiles.data.find(file => 
                    file.metadata && file.metadata.documentId === doc.id
                );
                
                if (existingFile) {
                    console.log(`✅ File already exists: ${doc.filename}`);
                    continue;
                }
                
                // Create file in vector store
                const file = await openai.files.create({
                    file: Buffer.from(doc.content, 'utf-8'),
                    purpose: 'assistants'
                });
                
                console.log(`📄 Created file in OpenAI: ${file.id}`);
                
                // Add file to vector store
                const vectorStoreFile = await openai.beta.vectorStores.files.create(VECTOR_STORE_ID, {
                    file_id: file.id,
                    metadata: {
                        documentId: doc.id,
                        filename: doc.filename,
                        fileType: doc.fileType,
                        uploadedAt: doc.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                    }
                });
                
                console.log(`🔗 Added file to vector store: ${vectorStoreFile.id}`);
                
                console.log(`✅ Uploaded to vector store: ${doc.filename} (${file.id})`);
                
            } catch (error) {
                console.error(`❌ Error uploading ${doc.filename}:`, error);
            }
        }
        
        console.log('✅ Vector Store synchronization completed');
        return { success: true, documentsProcessed: documents.length };
        
    } catch (error) {
        console.error('❌ Vector Store sync error:', error);
        throw error;
    }
}

// ============================================================================
// INTELLIGENT TROUBLESHOOTING WITH IMAGE ANALYSIS
// ============================================================================

exports.analyzeTroubleshootingImage = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { imageDescription, userMessage, vehicleModel } = req.body;

            if (!imageDescription && !userMessage) {
                return res.status(400).json({ error: 'Image description or user message is required' });
            }

            console.log('🔍 Analyzing troubleshooting request...');
            console.log('Image description:', imageDescription);
            console.log('User message:', userMessage);
            console.log('Vehicle model:', vehicleModel);

            // Analyze the image description to identify the problem
            const problemAnalysis = await analyzeProblemFromImage(imageDescription, userMessage);
            console.log('🎯 Problem analysis:', problemAnalysis);

            // Search for relevant solutions in technical database
            const solutions = await searchTroubleshootingSolutions(problemAnalysis, vehicleModel);
            console.log('📚 Found solutions:', solutions.length);
            console.log('🔍 Search terms used:', problemAnalysis.searchTerms);
            console.log('🚗 Vehicle model:', vehicleModel);

            // Generate step-by-step solution
            const stepByStepSolution = await generateStepByStepSolution(problemAnalysis, solutions);

            return res.json({
                success: true,
                problemIdentified: problemAnalysis.problem,
                severity: problemAnalysis.severity,
                immediateAction: problemAnalysis.immediateAction,
                stepByStepSolution: stepByStepSolution,
                relevantDocuments: solutions.map(sol => ({
                    title: sol.title,
                    category: sol.category,
                    relevance: sol.relevance
                })),
                safetyWarning: problemAnalysis.safetyWarning
            });

        } catch (error) {
            console.error('❌ Troubleshooting analysis error:', error);
            return res.status(500).json({
                error: 'Troubleshooting analysis failed',
                message: error.message
            });
        }
    });
});

// Analyze problem from image description
async function analyzeProblemFromImage(imageDescription, userMessage) {
    try {
        const analysisPrompt = `Analysiere dieses Fahrzeugproblem basierend auf der Bildbeschreibung und Benutzeranfrage:

Bildbeschreibung: ${imageDescription || 'Keine Bildbeschreibung'}
Benutzeranfrage: ${userMessage || 'Keine spezifische Anfrage'}

Bitte analysiere:
1. Welches Problem wird angezeigt?
2. Wie schwerwiegend ist es? (niedrig/mittel/hoch/kritisch)
3. Welche sofortige Aktion ist erforderlich?
4. Gibt es Sicherheitswarnungen?

Antworte im JSON-Format:
{
  "problem": "Beschreibung des Problems",
  "severity": "niedrig/mittel/hoch/kritisch",
  "immediateAction": "Was der Benutzer sofort tun sollte",
  "safetyWarning": "Sicherheitswarnung falls erforderlich",
  "searchTerms": ["Suchbegriffe", "für", "Lösungssuche"]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Cadillac EV Fahrzeuge und deren Warnsysteme.' },
                { role: 'user', content: analysisPrompt }
            ],
            max_tokens: 500,
            temperature: 0.3
        });

        const analysisText = completion.choices[0].message.content;
        
        // Try to parse JSON response
        try {
            const parsed = JSON.parse(analysisText);
            // Ensure searchTerms is an array and add VISTIQ-specific terms
            if (!parsed.searchTerms || !Array.isArray(parsed.searchTerms)) {
                parsed.searchTerms = ['warnung', 'problem', 'fehler', 'vistiq', 'dashboard'];
            }
            // Add VISTIQ-specific search terms
            parsed.searchTerms.push('vistiq', 'warnsymbol', 'dashboard', 'ausrufezeichen', 'fahrzeugwarnung');
            return parsed;
        } catch (parseError) {
            // Fallback if JSON parsing fails
            return {
                problem: analysisText,
                severity: 'mittel',
                immediateAction: 'Fahrzeug sicher abstellen und Handbuch konsultieren',
                safetyWarning: 'Bei Unsicherheit Werkstatt kontaktieren',
                searchTerms: ['warnung', 'problem', 'fehler', 'vistiq', 'dashboard', 'ausrufezeichen']
            };
        }

    } catch (error) {
        console.error('Error analyzing problem:', error);
        return {
            problem: 'Unbekanntes Problem erkannt',
            severity: 'mittel',
            immediateAction: 'Fahrzeug sicher abstellen und Handbuch konsultieren',
            safetyWarning: 'Bei Unsicherheit Werkstatt kontaktieren',
            searchTerms: ['warnung', 'problem', 'fehler']
        };
    }
}

// Search for troubleshooting solutions
async function searchTroubleshootingSolutions(problemAnalysis, vehicleModel) {
    try {
        const searchTerms = problemAnalysis.searchTerms || [];
        const modelFilter = vehicleModel ? vehicleModel.toLowerCase() : '';
        
        // Search in technical database
        const snapshot = await db.collection('technicalDatabase')
            .where('isActive', '==', true)
            .get();
        
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Filter and score documents based on relevance
        const scoredDocuments = documents.map(doc => {
            let relevance = 0;
            const content = doc.content.toLowerCase();
            const title = (doc.title || doc.filename || '').toLowerCase();
            
            // Score based on search terms
            searchTerms.forEach(term => {
                const lowerTerm = term.toLowerCase();
                if (content.includes(lowerTerm)) relevance += 2;
                if (title.includes(lowerTerm)) relevance += 3;
                
                // Also check for partial matches
                if (content.includes(lowerTerm.substring(0, 5))) relevance += 1;
                if (title.includes(lowerTerm.substring(0, 5))) relevance += 1;
            });
            
            // Score based on vehicle model
            if (modelFilter && content.includes(modelFilter)) relevance += 1;
            
            // Score based on category
            if (doc.category === 'Troubleshooting') relevance += 2;
            if (doc.subcategory === 'Warnings') relevance += 2;
            
            // VISTIQ-specific scoring
            if (content.includes('vistiq')) relevance += 3;
            if (content.includes('warnsymbol')) relevance += 2;
            if (content.includes('dashboard')) relevance += 2;
            if (content.includes('ausrufezeichen')) relevance += 2;
            if (content.includes('fahrzeugwarnung')) relevance += 2;
            
            // Charging system scoring
            if (content.includes('ladesystem')) relevance += 2;
            if (content.includes('ladevorgang')) relevance += 2;
            if (content.includes('batterie')) relevance += 1;
            
            // Infotainment scoring
            if (content.includes('infotainment')) relevance += 2;
            if (content.includes('display')) relevance += 1;
            if (content.includes('system')) relevance += 1;
            
            return {
                ...doc,
                relevance: relevance
            };
        });

        // Sort by relevance and return top results
        return scoredDocuments
            .filter(doc => doc.relevance > 0)
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5);

    } catch (error) {
        console.error('Error searching solutions:', error);
        return [];
    }
}

// Generate step-by-step solution
async function generateStepByStepSolution(problemAnalysis, solutions) {
    try {
        const solutionContext = solutions.map(sol => 
            `${sol.title || sol.filename}:\n${sol.content.substring(0, 300)}...`
        ).join('\n\n');

        const solutionPrompt = `Erstelle eine Schritt-für-Schritt-Lösung für dieses Cadillac EV Problem:

Problem: ${problemAnalysis.problem}
Schweregrad: ${problemAnalysis.severity}
Sofortige Aktion: ${problemAnalysis.immediateAction}

Verfügbare technische Dokumente:
${solutionContext}

Erstelle eine klare, strukturierte Lösung mit:
1. Sicherheitshinweisen
2. Vorbereitung
3. Schritt-für-Schritt-Anleitung
4. Verifikation
5. Nächste Schritte bei Problemen

Formatiere es als Markdown mit klaren Überschriften und nummerierten Schritten.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Du bist ein Cadillac EV Techniker und erstellst detaillierte Reparaturanleitungen.' },
                { role: 'user', content: solutionPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.4
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Error generating solution:', error);
        return `## Problemlösung für: ${problemAnalysis.problem}

### Sofortige Maßnahmen:
${problemAnalysis.immediateAction}

### Allgemeine Schritte:
1. Fahrzeug sicher abstellen
2. Handbuch konsultieren
3. Bei Unsicherheit Werkstatt kontaktieren

### Kontakt:
- Notfall: 0800 123 456
- Werkstatt: 044 123 4567`;
    }
}

// ============================================================================
// DEBUG VECTOR STORE ENDPOINT
// ============================================================================

exports.debugVectorStore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            await debugVectorStore();
            return res.json({ success: true, message: 'Debug completed, check logs' });
        } catch (error) {
            console.error('❌ Debug failed:', error);
            return res.status(500).json({ error: 'Debug failed', message: error.message });
        }
    });
});

// ============================================================================
// MANUAL VECTOR STORE SYNC ENDPOINT
// ============================================================================

exports.syncVectorStore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('🔄 Manual Vector Store sync requested');
            const result = await syncVectorStore();
            
            return res.json({
                success: true,
                message: 'Vector Store synchronized successfully',
                documentsProcessed: result.documentsProcessed
            });
            
        } catch (error) {
            console.error('❌ Manual Vector Store sync failed:', error);
            return res.status(500).json({
                error: 'Vector Store sync failed',
                message: error.message
            });
        }
    });
});

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

            // First, search the knowledge base directly
            console.log('🔍 Searching knowledge base for:', message);
            const knowledgeResults = await searchKnowledgeBase(message);
            console.log('📚 Knowledge base results:', knowledgeResults.length, 'documents found');

            // Create a context from knowledge base
            let context = '';
            if (knowledgeResults.length > 0) {
                context = '\n\nRelevante Informationen aus der Wissensdatenbank:\n';
                knowledgeResults.forEach((doc, index) => {
                    context += `\n${index + 1}. ${doc.filename}:\n${doc.content.substring(0, 500)}...\n`;
                });
            }

            // Use OpenAI Chat Completions API with knowledge base context
            const systemPrompt = `Du bist ein hilfreicher Assistent für Cadillac EV Kunden. 
            Du hast Zugriff auf die neuesten Informationen über Cadillac EV Fahrzeuge.
            Antworte auf Deutsch, es sei denn, der Benutzer fragt auf einer anderen Sprache.
            Sei präzise, hilfreich und professionell.
            ${context}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            const responseText = completion.choices[0].message.content;

            return res.json({
                response: responseText,
                threadId: threadId || 'direct-chat',
                sources: knowledgeResults.map(doc => doc.filename)
            });

        } catch (error) {
            console.error('Error in chat endpoint:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// Helper function to search knowledge base
async function searchKnowledgeBase(query) {
    try {
        const snapshot = await db.collection('knowledgebase')
            .where('isActive', '==', true)
            .get();
        
        const documents = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            documents.push({
                id: doc.id,
                ...data
            });
        });

        // Enhanced text search including tags and categories
        const results = documents.filter(doc => {
            const searchTerms = query.toLowerCase().split(' ');
            const content = (doc.content || '').toLowerCase();
            const filename = (doc.filename || '').toLowerCase();
            const category = (doc.category || '').toLowerCase();
            const subcategory = (doc.subcategory || '').toLowerCase();
            const tags = (doc.tags || []).map(t => t.toLowerCase()).join(' ');
            
            return searchTerms.some(term => 
                content.includes(term) || 
                filename.includes(term) || 
                category.includes(term) || 
                subcategory.includes(term) ||
                tags.includes(term)
            );
        });

        return results.slice(0, 3); // Return top 3 results
    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return [];
    }
}

// ============================================================================
// GENERATE CHAT RESPONSE ENDPOINT
// ============================================================================

exports.generateChatResponse = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { message, knowledgeBase, technicalContext, chatId, conversationHistory, language, region, units, context: userContext } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            if (!process.env.OPENAI_API_KEY && !functions.config().openai.key) {
                return res.status(500).json({ error: 'OpenAI API key not configured' });
            }

            // Build context from the provided context array (from frontend search)
            let context = '';
            let availableImages = [];
            
            // Detect which model user is asking about from the message
            const messageLower = message.toLowerCase();
            const requestedModel = 
                messageLower.includes('lyriq-v') || messageLower.includes('lyriq v') ? 'LYRIQ-V' :
                messageLower.includes('lyriq') ? 'LYRIQ' :
                messageLower.includes('vistiq') ? 'VISTIQ' :
                messageLower.includes('optiq') ? 'OPTIQ' : null;
            
            if (userContext && Array.isArray(userContext) && userContext.length > 0) {
                console.log('📚 Using context from frontend search:', userContext.length, 'documents');
                console.log('🚗 Detected requested model:', requestedModel || 'None detected');
                
                // Filter documents to only include requested model (if detected)
                let filteredContext = userContext;
                if (requestedModel) {
                    filteredContext = userContext.filter(doc => {
                        const docTitle = (doc.title || '').toUpperCase();
                        return docTitle.includes(requestedModel);
                    });
                    console.log(`✂️  Filtered to ${filteredContext.length} documents matching ${requestedModel}`);
                }
                
                // Fetch images from Firestore for filtered documents
                if (requestedModel && filteredContext.length > 0) {
                    try {
                        const docId = `cadillac-${requestedModel.toLowerCase()}-swiss-2025`;
                        const docSnapshot = await db.collection('knowledge-base').doc(docId).get();
                        
                        if (docSnapshot.exists) {
                            const docData = docSnapshot.data();
                            if (docData.images && docData.images.length > 0) {
                                console.log(`✅ Loaded ${docData.images.length} images from Firestore for ${requestedModel}`);
                                docData.images.forEach(imgUrl => {
                                    availableImages.push({ url: imgUrl, title: requestedModel, category: 'Official' });
                                });
                            }
                        }
                    } catch (error) {
                        console.error('❌ Error fetching images from Firestore:', error);
                    }
                }
                
                context += '=== RELEVANT DOCUMENTS FROM DATABASE ===\n\n';
                filteredContext.forEach((doc, index) => {
                    context += `Document ${index + 1} - [${doc.source}]\n`;
                    context += `Title: ${doc.title}\n`;
                    if (doc.category) context += `Category: ${doc.category}\n`;
                    if (doc.tags && doc.tags.length > 0) context += `Tags: ${doc.tags.join(', ')}\n`;
                    context += `Content:\n${doc.content || doc.fullContent}\n`;
                    context += '\n' + '='.repeat(80) + '\n\n';
                });
                
                console.log('🖼️  Total images available:', availableImages.length);
            }
            
            // Fallback to old format if no context array provided
            if (!context && knowledgeBase === true) {
                context += 'Knowledge Base Information: Available\n';
            } else if (!context && knowledgeBase && knowledgeBase.length > 0) {
                context += 'Knowledge Base Information:\n';
                knowledgeBase.forEach((doc, index) => {
                    context += `Document ${index + 1}: ${doc.filename}\n`;
                    context += `Content: ${doc.content}\n\n`;
                });
            }

            // Add technical context if provided
            if (technicalContext === true) {
                context += 'Technical Database Information: Available\n';
            } else if (technicalContext && technicalContext.length > 0) {
                context += 'Technical Database Information:\n';
                technicalContext.forEach((doc, index) => {
                    context += `Technical Document ${index + 1}: ${doc.filename}\n`;
                    context += `Category: ${doc.category} - ${doc.subcategory}\n`;
                    context += `Content: ${doc.content}\n\n`;
                });
            }

            // Build conversation history for context (limit to last 10 messages to avoid token limit)
            let conversationContext = '';
            if (conversationHistory && conversationHistory.length > 0) {
                conversationContext += 'Previous Conversation Context (last 10 messages):\n';
                const recentHistory = conversationHistory.slice(-10); // Only take last 10 messages
                recentHistory.forEach((msg, index) => {
                    const role = msg.role === 'user' ? 'User' : 'Assistant';
                    conversationContext += `${role}: ${msg.content}\n`;
                });
                conversationContext += '\n';
            }

            // Create the enhanced prompt with conversation context
            const isGerman = language === 'de' || language === 'german';
            const isEuropean = region === 'EU' || region === 'europe';
            const useMetric = units === 'metric';
            
            let systemContext = '';
            if (isGerman) {
                systemContext = `Sie sind C.I.S (Cadillac Information System), ein KI-Assistent spezialisiert auf Cadillac Elektrofahrzeuge für den europäischen Markt (Schweiz/Deutschland). Sie haben Zugang zu einer umfassenden Wissensdatenbank und technischen Datenbank mit AKTUELLEN offiziellen Preisen und Spezifikationen.

KRITISCHE REGELN - STRIKT BEFOLGEN:
- Antworten Sie IMMER auf Deutsch
- Verwenden Sie SCHWEIZER Preise in CHF (Schweizer Franken) - dies ist PRIORITÄT!
- Verwenden Sie europäische Einheiten (km, kWh, °C)
- Beziehen Sie sich auf den Schweizer/europäischen Markt
- Verwenden Sie AUSSCHLIESSLICH die bereitgestellten Dokumente - KEINE EIGENEN INFORMATIONEN HINZUFÜGEN!
- ERFINDEN SIE KEINE SPEZIFIKATIONEN die nicht in den Dokumenten stehen
- Wenn Zahlen in den Dokumenten stehen, zitieren Sie diese EXAKT wie sie in den Dokumenten stehen
- Wenn Preise in den Dokumenten stehen, geben Sie diese GENAU an (z.B. "Ab CHF 90'100")
- Wenn eine Information NICHT in den Dokumenten steht, sagen Sie das klar
- Verwenden Sie professionelle, hilfreiche Sprache

FORMATIERUNG - STRUKTURIERTE ANTWORT:
- Erstellen Sie eine STRUKTURIERTE, professionelle Antwort mit Markdown
- Verwenden Sie ## Überschriften für Hauptabschnitte (z.B. ## Exterieur, ## Interieur, ## Technologie)
- Verwenden Sie ### für Unterabschnitte
- Nutzen Sie Listen, **Fettdruck**, und klare Struktur
- WICHTIG: Fügen Sie KEINE Bilder ein! (Das System fügt diese automatisch hinzu)
- Strukturieren Sie nach Themen: Preis, Exterieur, Interieur, Technologie, Performance, Reichweite, Laden

VERBOTEN:
- KEINE Leistungsangaben (PS, kW) erfinden wenn sie nicht in den Dokumenten stehen
- KEINE ungefähren Zahlen verwenden wenn exakte Zahlen vorhanden sind
- KEINE Informationen aus Ihrem allgemeinen Wissen hinzufügen
- NIEMALS "483 Kilometer" als Reichweite nennen - die korrekte LYRIQ Reichweite ist 530 km!
- KEINE Bilder von anderen Modellen zeigen wenn nach einem spezifischen Modell gefragt wurde`;
            } else {
                systemContext = `You are C.I.S (Cadillac Information System), an AI assistant specialized in Cadillac EV vehicles for the European market (Switzerland/Germany). You have access to a comprehensive knowledge base and technical database with CURRENT official prices and specifications.

CRITICAL NOTES:
- Always respond in German
- Use SWISS prices in CHF (Swiss Francs) - this is PRIORITY!
- Use European units (km, kWh, °C)
- Reference the Swiss/European market
- Use ONLY the provided documents for prices and technical data
- If prices are in the documents, state them EXACTLY (e.g. "Ab CHF 90'100")
- Format responses beautifully with Markdown (## Headings, Lists, **Bold**)
- Use professional, helpful language
- Add [SOURCE: Document name] at the end of relevant sections`;
            }
            
            let prompt = `${systemContext}

${conversationContext}${context}

Current User Question: ${message}

Please provide a detailed, helpful response based on the available information and conversation context. If you reference specific documents, include source citations in the format [SOURCE: filename] at the end of relevant sentences.`;

            // Simple token estimation (roughly 4 characters per token)
            const estimatedTokens = Math.ceil(prompt.length / 4);
            if (estimatedTokens > 2000) {
                // If context is too large, significantly reduce knowledge base content
                console.log(`Context too large (${estimatedTokens} tokens), reducing knowledge base content`);
                const reducedContext = context.substring(0, context.length * 0.1); // Reduce by 90%
                const reducedConversationContext = conversationContext.substring(0, conversationContext.length * 0.3); // Reduce conversation by 70%
                prompt = `You are C.I.S (Cadillac Information System), an AI assistant specialized in Cadillac EV vehicles.

${reducedConversationContext}${reducedContext}

Current User Question: ${message}

Please provide a helpful response based on the available information.`;
            }

            // Build messages array with conversation history
            const messages = [
                {
                    role: 'system',
                    content: isGerman ? 
                        'Sie sind C.I.S, ein spezialisierter KI-Assistent für Cadillac Elektrofahrzeuge. Geben Sie präzise, hilfreiche Informationen basierend auf der bereitgestellten Wissensdatenbank und technischen Datenbank. Verwenden Sie europäische Einheiten und beziehen Sie sich auf den deutschen Markt. Formatieren Sie Antworten schön mit Markdown.' :
                        'You are C.I.S, a specialized AI assistant for Cadillac EV vehicles. Provide accurate, helpful information based on the provided knowledge base and technical database. Always respond in German, use European units, and format responses beautifully with Markdown.'
                }
            ];

            // Add conversation history to messages
            if (conversationHistory && conversationHistory.length > 0) {
                conversationHistory.forEach(msg => {
                    messages.push({
                        role: msg.role,
                        content: msg.content
                    });
                });
            }

            // Add current user message
            messages.push({
                role: 'user',
                content: prompt
            });

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 2000,
                temperature: 0.5
            });

            const response = completion.choices[0].message.content;

            // Return response with filtered images array for frontend placement
            return res.json({ 
                response: response,
                images: availableImages.map(img => img.url),
                model: requestedModel
            });

        } catch (error) {
            console.error('Error generating chat response:', error);
            return res.status(500).json({ error: 'Failed to generate response' });
        }
    });
});

// ============================================================================
// CHAT MANAGEMENT ENDPOINTS
// ============================================================================

exports.createChat = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { title } = req.body;
            const userId = req.headers['user-id'] || 'anonymous';

            const chatData = {
                title: title || 'New Chat',
                userId: userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('chats').add(chatData);

            return res.json({
                chatId: docRef.id,
                ...chatData
            });

        } catch (error) {
            console.error('Error creating chat:', error);
            return res.status(500).json({ error: 'Failed to create chat' });
        }
    });
});

exports.getChats = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const userId = req.headers['user-id'] || 'anonymous';
            
            // First try to get all chats for the user (no ordering to avoid index requirement)
            const snapshot = await db.collection('chats')
                .where('userId', '==', userId)
                .get();
                    
            const chats = [];
            snapshot.forEach(doc => {
                chats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by updatedAt in JavaScript (no index required)
            chats.sort((a, b) => {
                const dateA = a.updatedAt ? a.updatedAt.toDate() : new Date(0);
                const dateB = b.updatedAt ? b.updatedAt.toDate() : new Date(0);
                return dateB - dateA; // Descending order (newest first)
            });

            return res.json({ chats });

        } catch (error) {
            console.error('Error fetching chats:', error);
            return res.status(500).json({ error: 'Failed to fetch chats' });
        }
    });
});

exports.deleteChat = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'DELETE') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            // Support both query and body parameters
            const chatId = req.query.chatId || req.body.chatId;

            if (!chatId) {
                return res.status(400).json({ error: 'Chat ID is required' });
            }

            // Delete chat messages first
            const messagesSnapshot = await db.collection('messages')
                .where('chatId', '==', chatId)
                .get();

            const batch = db.batch();
            messagesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete the chat
            await db.collection('chats').doc(chatId).delete();

            await batch.commit();

            return res.json({ success: true });

        } catch (error) {
            console.error('Error deleting chat:', error);
            return res.status(500).json({ error: 'Failed to delete chat' });
        }
    });
});

exports.clearAllChats = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            // Support both headers and body parameters
            const userId = req.headers['user-id'] || req.body.userId || 'anonymous';

            // Get all chats for user
            const chatsSnapshot = await db.collection('chats')
                .where('userId', '==', userId)
                .get();

            const batch = db.batch();
            
            // Delete all messages for each chat
            for (const chatDoc of chatsSnapshot.docs) {
                const messagesSnapshot = await db.collection('messages')
                    .where('chatId', '==', chatDoc.id)
                    .get();
                
                messagesSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                // Delete the chat
                batch.delete(chatDoc.ref);
            }

            await batch.commit();

            return res.json({ success: true });

        } catch (error) {
            console.error('Error clearing all chats:', error);
            return res.status(500).json({ error: 'Failed to clear chats' });
        }
    });
});

exports.updateChatTitle = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { chatId, title } = req.body;

            if (!chatId || !title) {
                return res.status(400).json({ error: 'Chat ID and title are required' });
            }

            await db.collection('chats').doc(chatId).update({
                title: title,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.json({ success: true });

        } catch (error) {
            console.error('Error updating chat title:', error);
            return res.status(500).json({ error: 'Failed to update chat title' });
        }
    });
});

exports.saveChatMessage = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { chatId, role, content, thinkingTime } = req.body;

            if (!chatId || !role || !content) {
                return res.status(400).json({ error: 'Chat ID, role, and content are required' });
            }

            const messageData = {
                chatId: chatId,
                role: role,
                content: content,
                thinkingTime: thinkingTime || 0,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('messages').add(messageData);

            // Update chat's updatedAt timestamp
            await db.collection('chats').doc(chatId).update({
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.json({ success: true });

        } catch (error) {
            console.error('Error saving chat message:', error);
            return res.status(500).json({ error: 'Failed to save message' });
        }
    });
});

exports.getChatMessages = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { chatId } = req.query;

            if (!chatId) {
                return res.status(400).json({ error: 'Chat ID is required' });
            }

            // Get messages without ordering to avoid index requirement
            const snapshot = await db.collection('messages')
                .where('chatId', '==', chatId)
                .get();

            const messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by timestamp in JavaScript (no index required)
            messages.sort((a, b) => {
                const timestampA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                const timestampB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                return timestampA - timestampB; // Ascending order (oldest first)
            });

            return res.json({ messages });
            
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });
});

// ============================================================================
// SETTINGS ENDPOINT
// ============================================================================

exports.settings = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method === 'GET') {
            try {
                // Check for app settings first (for branding and welcome messages)
                const appSettingsDoc = await db.collection('app_settings').doc('branding').get();

                if (appSettingsDoc.exists) {
                    const appSettings = appSettingsDoc.data();
                    return res.json({
                        welcomeTitle: appSettings.welcomeTitle || 'Cadillac EV Assistant',
                        welcomeSubtitle: appSettings.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                        theme: 'light',
                        model: 'gpt-4',
                        temperature: 0.7,
                        maxTokens: 2000
                    });
                } else {
                    // Return default settings if no app settings exist
                    return res.json({
                        welcomeTitle: 'Cadillac EV Assistant',
                        welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                        theme: 'light',
                        model: 'gpt-4',
                        temperature: 0.7,
                        maxTokens: 2000
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                return res.status(500).json({ error: 'Failed to fetch settings' });
            }
        } else if (req.method === 'POST') {
            try {
                const userId = req.headers['user-id'] || 'anonymous';
                const settings = req.body;

                await db.collection('settings').doc(userId).set(settings, { merge: true });

                return res.json({ success: true });
            } catch (error) {
                console.error('Error saving settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    });
});

// Branding settings endpoint
exports.branding = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method === 'GET') {
            try {
                const brandingDoc = await db.collection('app_settings').doc('branding').get();
                
                if (brandingDoc.exists) {
                    const branding = brandingDoc.data();
                        return res.json({
                            success: true,
                            branding: {
                                brandText: branding.brandText || 'Cadillac EV',
                                welcomeTitle: branding.welcomeTitle || 'Cadillac EV Assistant',
                                welcomeSubtitle: branding.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                                pageTitle: branding.pageTitle || 'Cadillac EV Assistant',
                                primaryColor: branding.primaryColor || '#3b82f6',
                                secondaryColor: branding.secondaryColor || '#6b7280',
                                logo: branding.logo || null,
                                logoBackgroundTransparent: branding.logoBackgroundTransparent || false,
                                showLogoInNav: branding.showLogoInNav !== false,
                                showWelcomeMessage: branding.showWelcomeMessage !== false,
                                enableAnimations: branding.enableAnimations !== false,
                                theme: branding.theme || 'light'
                            }
                        });
                } else {
                    // Return default branding settings
                    return res.json({
                        success: true,
                        branding: {
                            brandText: 'Cadillac EV',
                            welcomeTitle: 'Cadillac EV Assistant',
                            welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                            pageTitle: 'Cadillac EV Assistant',
                            primaryColor: '#3b82f6',
                            secondaryColor: '#6b7280',
                            logo: null,
                            logoBackgroundTransparent: false,
                            showLogoInNav: true,
                            showWelcomeMessage: true,
                            enableAnimations: true,
                            theme: 'light'
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching branding settings:', error);
                return res.status(500).json({ error: 'Failed to fetch branding settings' });
            }
        } else if (req.method === 'POST') {
            try {
                const branding = req.body;
                
                // Save branding settings to database
                await db.collection('app_settings').doc('branding').set(branding, { merge: true });
                
                console.log('Branding settings saved:', branding);
                return res.json({ success: true, message: 'Branding settings saved successfully' });
            } catch (error) {
                console.error('Error saving branding settings:', error);
                return res.status(500).json({ error: 'Failed to save branding settings' });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    });
});

// ============================================================================
// KNOWLEDGE BASE ENDPOINTS
// ============================================================================

exports.knowledgebase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method === 'GET') {
            try {
                // Check if specific document ID is requested
                const pathParts = req.path.split('/').filter(part => part);
                if (pathParts.length > 0) {
                    const docId = pathParts[pathParts.length - 1];
                    const doc = await db.collection('knowledgebase').doc(docId).get();
                    
                    if (doc.exists) {
                        return res.json({
                            id: doc.id,
                            ...doc.data()
                        });
                    } else {
                        return res.status(404).json({ error: 'Document not found' });
                    }
                } else {
                    // Return all documents
                    const snapshot = await db.collection('knowledgebase')
                        .where('isActive', '==', true)
                        .get();
                    const documents = [];
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        documents.push({
                            id: doc.id,
                            filename: data.filename || data.name,
                            content: data.content,
                            fileType: data.fileType,
                            category: data.category || 'General',
                            subcategory: data.subcategory || 'General',
                            tags: data.tags || [],
                            size: data.size || 0,
                            uploadedAt: data.uploadedAt,
                            isActive: data.isActive
                        });
                    });

                    return res.json({ documents });
                }
            } catch (error) {
                console.error('Error fetching knowledge base:', error);
                return res.status(500).json({ error: 'Failed to fetch knowledge base' });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    });
});

exports.upload = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            // Support both multipart/form-data and JSON uploads
            const contentType = req.headers['content-type'] || '';
            
            if (contentType.includes('application/json')) {
                // JSON upload
                const { filename, content, fileType } = req.body;
                
                if (!filename || !content) {
                    return res.status(400).json({ error: 'Filename and content are required' });
                }

                // Upload to Firebase Storage
                const bucket = admin.storage().bucket('cis-de.appspot.com');
                const fileBuffer = Buffer.from(content, 'base64');
                const storagePath = `knowledge-base/${Date.now()}_${filename}`;
                const file = bucket.file(storagePath);
                
                await file.save(fileBuffer, {
                    metadata: {
                        contentType: getContentType(fileType || filename.split('.').pop().toLowerCase()),
                        metadata: {
                            uploadedBy: 'user',
                            originalFilename: filename
                        }
                    }
                });
                
                // Make file publicly accessible
                await file.makePublic();
                const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
                
                console.log('✅ File uploaded to Storage:', downloadURL);

                const docRef = await db.collection('knowledgebase').add({
                    filename: filename,
                    content: content,
                    fileType: fileType || filename.split('.').pop().toLowerCase(),
                    category: req.body.category || 'General',
                    subcategory: req.body.subcategory || 'General',
                    tags: req.body.tags || [],
                    size: fileBuffer.length,
                    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                    uploadedBy: 'user',
                    isActive: true,
                    storagePath: storagePath,
                    downloadURL: downloadURL
                });
                
                console.log('📄 Document saved with ID:', docRef.id, 'isActive:', true);

                // Trigger Vector Store sync in background
                syncVectorStore().catch(error => {
                    console.error('Background Vector Store sync failed:', error);
                });
                
                // Automatically index images from the uploaded document
                try {
                    await indexDocumentImages(docRef.id, 'knowledgeBase', {
                        filename: filename,
                        fileType: fileType || filename.split('.').pop().toLowerCase(),
                        content: content
                    });
                    console.log(`✅ Auto-indexed images from ${filename}`);
                } catch (indexError) {
                    console.error(`❌ Error auto-indexing ${filename}:`, indexError);
                    // Don't fail the upload if indexing fails
                }

                return res.json({ 
                    success: true,
                    files: [{
                        documentId: docRef.id,
                        filename: filename,
                        size: Buffer.byteLength(content, 'utf8')
                    }]
                });
            } else {
                // Multipart upload using busboy
                const busboy = require('busboy');
                const bb = busboy({ 
                    headers: req.headers,
                    limits: {
                        fileSize: 10 * 1024 * 1024 // 10MB limit
                    }
                });
                const uploads = [];
                const filePromises = [];
                let finished = false;

                bb.on('file', (fieldname, file, info) => {
                    const { filename, mimeType } = info;
                    const chunks = [];

                    console.log('Processing file:', filename, 'Type:', mimeType);

                    const filePromise = new Promise((resolve, reject) => {
                        file.on('data', (data) => {
                            chunks.push(data);
                        });

                        file.on('end', async () => {
                            try {
                                const buffer = Buffer.concat(chunks);
                                const fileType = filename.split('.').pop().toLowerCase();
                                let fileContent = buffer.toString('utf-8');

                                console.log('File processed:', filename, 'Size:', buffer.length);

                                // Upload to Firebase Storage
                                const bucket = admin.storage().bucket('cis-de.appspot.com');
                                const storagePath = `knowledge-base/${Date.now()}_${filename}`;
                                const storageFile = bucket.file(storagePath);
                                
                                await storageFile.save(buffer, {
                                    metadata: {
                                        contentType: getContentType(fileType),
                                        metadata: {
                                            uploadedBy: 'user',
                                            originalFilename: filename
                                        }
                                    }
                                });
                                
                                // Make file publicly accessible
                                await storageFile.makePublic();
                                const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
                                
                                console.log('✅ File uploaded to Storage:', downloadURL);

                                // Store in Firestore
                                const docRef = await db.collection('knowledgebase').add({
                                    filename: filename,
                                    content: fileContent,
                                    fileType: fileType,
                                    size: buffer.length,
                                    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                                    uploadedBy: 'user',
                                    isActive: true,
                                    originalFileData: buffer.toString('base64'),
                                    storagePath: storagePath,
                                    downloadURL: downloadURL
                                });

                                uploads.push({
                                    documentId: docRef.id,
                                    filename: filename,
                                    size: buffer.length
                                });
                                
                                // Automatically index images from the uploaded document
                                try {
                                    await indexDocumentImages(docRef.id, 'knowledgeBase', {
                                        filename: filename,
                                        fileType: fileType,
                                        originalFileData: buffer.toString('base64')
                                    });
                                    console.log(`✅ Auto-indexed images from ${filename}`);
                                } catch (indexError) {
                                    console.error(`❌ Error auto-indexing ${filename}:`, indexError);
                                    // Don't fail the upload if indexing fails
                                }
                                
                                console.log('File saved to Firestore:', docRef.id);
                                
                                // Trigger Vector Store sync in background
                                syncVectorStore().catch(error => {
                                    console.error('Background Vector Store sync failed:', error);
                                });
                                resolve();
                            } catch (error) {
                                console.error('Error processing file:', error);
                                reject(error);
                            }
                        });

                        file.on('error', (error) => {
                            console.error('File stream error:', error);
                            reject(error);
                        });
                    });

                    filePromises.push(filePromise);
                });

                bb.on('finish', async () => {
                    if (finished) return;
                    finished = true;
                    
                    try {
                        console.log('All files processed, waiting for promises...');
                        await Promise.all(filePromises);
                        console.log('Upload successful:', uploads);
                        
                        res.json({ 
                            success: true,
                            files: uploads
                        });
                    } catch (error) {
                        console.error('File processing error:', error);
                        res.status(500).json({
                            error: 'File processing error',
                            message: error.message
                        });
                    }
                });

                bb.on('error', (error) => {
                    if (finished) return;
                    finished = true;
                    
                    console.error('Busboy error:', error);
                    res.status(500).json({
                        error: 'File upload error',
                        message: error.message
                    });
                });

                // Handle request errors
                req.on('error', (error) => {
                    if (finished) return;
                    finished = true;
                    
                    console.error('Request error:', error);
                    res.status(500).json({
                        error: 'Request error',
                        message: error.message
                    });
                });

                // Pipe the request to busboy
                req.pipe(bb);
            }

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    });
});

exports.uploadWithOverwrite = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { filename, content, fileData, overwrite = false } = req.body;

            if (!filename) {
                return res.status(400).json({ error: 'Filename is required' });
            }

            if (!content && !fileData) {
                return res.status(400).json({ error: 'Either content or fileData is required' });
            }

            // Check if file already exists
            const existingQuery = await db.collection('knowledgebase')
                .where('filename', '==', filename)
                .where('isActive', '==', true)
                .get();

            if (!existingQuery.empty && !overwrite) {
                return res.status(409).json({ 
                    error: 'File already exists',
                    existingFile: {
                        id: existingQuery.docs[0].id,
                        filename: existingQuery.docs[0].data().filename,
                        uploadedAt: existingQuery.docs[0].data().uploadedAt
                    }
                });
            }

            let processedContent = content;
            let fileType = 'text';

            // Process file data if provided
            if (fileData) {
                const buffer = Buffer.from(fileData, 'base64');
                
                if (filename.toLowerCase().endsWith('.pdf')) {
                    fileType = 'pdf';
                    try {
                        const pdfData = await pdfParse(buffer);
                        processedContent = pdfData.text;
                    } catch (pdfError) {
                        console.error('Error parsing PDF:', pdfError);
                        processedContent = `PDF Document: ${filename}`;
                    }
                } else if (filename.toLowerCase().endsWith('.txt')) {
                    fileType = 'text';
                    processedContent = buffer.toString('utf-8');
                } else if (filename.toLowerCase().endsWith('.md')) {
                    fileType = 'markdown';
                    processedContent = buffer.toString('utf-8');
                } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.png')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.gif')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.bmp')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else {
                    fileType = 'unknown';
                    processedContent = buffer.toString('utf-8');
                }
            }

            const documentData = {
                filename: filename,
                content: processedContent,
                fileType: fileType,
                category: category || 'General',
                subcategory: subcategory || 'General',
                tags: req.body.tags || [],
                originalFileData: fileData || null,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };

            let docRef;

            if (!existingQuery.empty && overwrite) {
                // Update existing document
                docRef = existingQuery.docs[0].ref;
                await docRef.update(documentData);
            } else {
                // Create new document
                docRef = await db.collection('knowledgebase').add(documentData);
            }

            return res.json({
                    id: docRef.id,
                ...documentData
            });

        } catch (error) {
            console.error('Error uploading file with overwrite:', error);
            return res.status(500).json({ error: 'Failed to upload file' });
        }
    });
});

// ============================================================================
// TECHNICAL DATABASE ENDPOINTS
// ============================================================================

// Knowledge Base API endpoint for chat
exports.knowledgeBase = functions.runWith({
    memory: '512MB',
    timeoutSeconds: 60
}).https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method === 'GET') {
            try {
                console.log('📚 Fetching Knowledge Base documents for chat...');
                const snapshot = await db.collection('knowledge-base')
                    .limit(100)
                    .get();
                    
                const documents = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    documents.push({
                        id: doc.id,
                        title: data.title || 'Untitled',
                        content: data.content || '',
                        fullContent: data.fullContent || data.content || '',
                        category: data.category || 'General',
                        tags: data.tags || [],
                        source: data.source || 'Knowledge Base',
                        images: data.images || [],
                        fileType: data.fileType || 'Document',
                        dateAdded: data.dateAdded
                    });
                });

                console.log(`✅ Returning ${documents.length} knowledge base documents`);
                return res.json({ documents });
            } catch (error) {
                console.error('❌ Error fetching knowledge base documents:', error);
                return res.status(500).json({ error: 'Failed to fetch knowledge base documents' });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    });
});

exports.technicalDatabase = functions.runWith({
    memory: '512MB',
    timeoutSeconds: 60
}).https.onRequest((req, res) => {
    cors(req, res, async () => {
            if (req.method === 'GET') {
            try {
                console.log('🔧 Fetching Technical Database documents for chat...');
                const snapshot = await db.collection('technical-database')
                    .limit(100)
                    .get();
                    
                const documents = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    documents.push({
                        id: doc.id,
                        title: data.title || data.name || data.filename || 'Untitled',
                        content: data.content || '',
                        fullContent: data.fullContent || data.content || '',
                        name: data.name || data.filename || 'Unnamed Document',
                        fileType: data.fileType || 'unknown',
                        category: data.category || 'General',
                        subcategory: data.subcategory || 'General',
                        tags: data.tags || [],
                        vehicleType: data.vehicleType || 'General',
                        images: data.images || [],
                        uploadedAt: data.uploadedAt,
                        size: data.size || 0,
                        isActive: data.isActive
                    });
                });

                console.log(`✅ Returning ${documents.length} technical database documents`);
                return res.json({ documents });
            } catch (error) {
                console.error('❌ Error fetching technical documents:', error);
                return res.status(500).json({ error: 'Failed to fetch technical documents' });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    });
});

exports.uploadTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { filename, content, fileData, category, subcategory, description } = req.body;

            if (!filename) {
                return res.status(400).json({ error: 'Filename is required' });
            }

            if (!content && !fileData) {
                return res.status(400).json({ error: 'Either content or fileData is required' });
            }

            let processedContent = content;
            let fileType = 'text';

            // Process file data if provided
            if (fileData) {
                const buffer = Buffer.from(fileData, 'base64');
                
                if (filename.toLowerCase().endsWith('.pdf')) {
                    fileType = 'pdf';
                    try {
                        const pdfData = await pdfParse(buffer);
                        processedContent = pdfData.text;
                    } catch (pdfError) {
                        console.error('Error parsing PDF:', pdfError);
                        processedContent = `PDF Document: ${filename}`;
                    }
                } else if (filename.toLowerCase().endsWith('.txt')) {
                    fileType = 'text';
                    processedContent = buffer.toString('utf-8');
                } else if (filename.toLowerCase().endsWith('.md')) {
                    fileType = 'markdown';
                    processedContent = buffer.toString('utf-8');
                } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.png')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.gif')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else if (filename.toLowerCase().endsWith('.bmp')) {
                    fileType = 'image';
                    processedContent = `Image file: ${filename}`;
                } else {
                    fileType = 'unknown';
                    processedContent = buffer.toString('utf-8');
                }
            }

            const documentData = {
                filename: filename,
                content: processedContent,
                fileType: fileType,
                category: category || 'Uncategorized',
                subcategory: subcategory || 'General',
                description: description || '',
                tags: req.body.tags || [],
                originalFileData: fileData || null, // Store original binary data
                originalPdfData: fileData || null, // Also store as PDF data for direct access
                size: fileData ? Buffer.from(fileData, 'base64').length : 0, // Store file size in bytes
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };

            const docRef = await db.collection('technicalDatabase').add(documentData);
            
            // Automatically index images from the uploaded document
            try {
                await indexDocumentImages(docRef.id, 'technicalDatabase', {
                    filename: filename,
                    fileType: fileType,
                    originalFileData: fileData,
                    category: category || 'Uncategorized',
                    subcategory: subcategory || 'General'
                });
                console.log(`✅ Auto-indexed images from technical document ${filename}`);
            } catch (indexError) {
                console.error(`❌ Error auto-indexing technical document ${filename}:`, indexError);
                // Don't fail the upload if indexing fails
            }

            return res.json({
                id: docRef.id,
                ...documentData
            });

    } catch (error) {
            console.error('Error uploading technical document:', error);
            return res.status(500).json({ error: 'Failed to upload technical document' });
        }
    });
});

exports.updateTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { docId, filename, content, category, subcategory, description } = req.body;

                if (!docId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            const updateData = {
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (filename) updateData.filename = filename;
            if (content) updateData.content = content;
            if (category) updateData.category = category;
            if (subcategory) updateData.subcategory = subcategory;
            if (description) updateData.description = description;

            await db.collection('technicalDatabase').doc(docId).update(updateData);

            return res.json({ success: true });

        } catch (error) {
            console.error('Error updating technical document:', error);
            return res.status(500).json({ error: 'Failed to update technical document' });
        }
    });
});

exports.deleteTechnicalDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { docId } = req.body;

            if (!docId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Get document data before deletion
            const docRef = db.collection('technicalDatabase').doc(docId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Document not found' });
            }

            const docData = docSnap.data();

            // Delete from Firestore
            await docRef.delete();

            // Remove from Vector Store if it has a vectorFileId
            if (docData.vectorFileId) {
                try {
                    await openai.beta.vectorStores.files.del(VECTOR_STORE_ID, docData.vectorFileId);
                    console.log('✅ Removed file from vector store:', docData.vectorFileId);
                } catch (vectorError) {
                    console.warn('⚠️ Could not remove from vector store:', vectorError.message);
                }
            }

            // Remove from image index if it exists
            try {
                const imageIndexQuery = await db.collection('imageIndex')
                    .where('documentId', '==', docId)
                    .get();
                
                const batch = db.batch();
                imageIndexQuery.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log('✅ Removed from image index');
            } catch (imageError) {
                console.warn('⚠️ Could not remove from image index:', imageError.message);
            }

            console.log('✅ Technical document completely deleted:', docId);
            return res.json({ success: true });

        } catch (error) {
            console.error('Error deleting technical document:', error);
            return res.status(500).json({ error: 'Failed to delete technical document' });
        }
    });
});

// Migrate technical document sizes
exports.migrateTechnicalDocSizes = functions.runWith({
    memory: '512MB',
    timeoutSeconds: 540
}).https.onRequest((req, res) => {
    cors(req, res, async () => {
        console.log('🔄 Starting migration to add file sizes to technical documents...');
        
        try {
            // Get all active technical documents
            const snapshot = await db.collection('technicalDatabase')
                .where('isActive', '==', true)
                .get();
            
            console.log(`📋 Found ${snapshot.size} documents to migrate`);
            
            let updated = 0;
            let skipped = 0;
            let errors = 0;
            
            for (const doc of snapshot.docs) {
                const data = doc.data();
                
                // Check if size already exists
                if (data.size && data.size > 0) {
                    console.log(`⏭️  Skipping ${data.filename || data.name} (already has size: ${data.size} bytes)`);
                    skipped++;
                    continue;
                }
                
                let calculatedSize = 0;
                
                // Try to get size from originalFileData
                if (data.originalFileData) {
                    try {
                        const buffer = Buffer.from(data.originalFileData, 'base64');
                        calculatedSize = buffer.length;
                        console.log(`📊 Calculated size for ${data.filename || data.name}: ${calculatedSize} bytes`);
                    } catch (e) {
                        console.error(`❌ Error calculating size from originalFileData:`, e.message);
                    }
                }
                // Try originalPdfData if originalFileData doesn't exist
                else if (data.originalPdfData) {
                    try {
                        const buffer = Buffer.from(data.originalPdfData, 'base64');
                        calculatedSize = buffer.length;
                        console.log(`📊 Calculated size for ${data.filename || data.name}: ${calculatedSize} bytes`);
                    } catch (e) {
                        console.error(`❌ Error calculating size from originalPdfData:`, e.message);
                    }
                }
                // Try content field as last resort
                else if (data.content) {
                    try {
                        calculatedSize = Buffer.byteLength(data.content, 'utf8');
                        console.log(`📊 Calculated size from content for ${data.filename || data.name}: ${calculatedSize} bytes`);
                    } catch (e) {
                        console.error(`❌ Error calculating size from content:`, e.message);
                    }
                }
                
                // Update the document with the calculated size
                if (calculatedSize > 0) {
                    try {
                        await doc.ref.update({ size: calculatedSize });
                        console.log(`✅ Updated ${data.filename || data.name} with size: ${calculatedSize} bytes`);
                        updated++;
                    } catch (e) {
                        console.error(`❌ Error updating document:`, e.message);
                        errors++;
                    }
                } else {
                    console.log(`⚠️  Could not determine size for ${data.filename || data.name}`);
                    errors++;
                }
            }
            
            console.log(`\n✅ Migration complete!`);
            console.log(`   📝 Total documents: ${snapshot.size}`);
            console.log(`   ✅ Updated: ${updated}`);
            console.log(`   ⏭️  Skipped: ${skipped}`);
            console.log(`   ❌ Errors: ${errors}`);
            
            return res.json({
                success: true,
                total: snapshot.size,
                updated,
                skipped,
                errors
            });
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return res.status(500).json({ error: 'Migration failed', details: error.message });
        }
    });
});

// Delete knowledge base document completely
exports.deleteDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { docId } = req.body;

            if (!docId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            // Get document data before deletion
            const docRef = db.collection('knowledgeBase').doc(docId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Document not found' });
            }

            const docData = docSnap.data();

            // Delete from Firestore
            await docRef.delete();

            // Remove from Vector Store if it has a vectorFileId
            if (docData.vectorFileId) {
                try {
                    await openai.beta.vectorStores.files.del(VECTOR_STORE_ID, docData.vectorFileId);
                    console.log('✅ Removed file from vector store:', docData.vectorFileId);
                } catch (vectorError) {
                    console.warn('⚠️ Could not remove from vector store:', vectorError.message);
                }
            }

            // Remove from image index if it exists
            try {
                const imageIndexQuery = await db.collection('imageIndex')
                    .where('documentId', '==', docId)
                    .get();
                
                const batch = db.batch();
                imageIndexQuery.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log('✅ Removed from image index');
            } catch (imageError) {
                console.warn('⚠️ Could not remove from image index:', imageError.message);
            }

            console.log('✅ Knowledge base document completely deleted:', docId);
            return res.json({ success: true });

        } catch (error) {
            console.error('Error deleting knowledge base document:', error);
            return res.status(500).json({ error: 'Failed to delete knowledge base document' });
        }
    });
});

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
            if (fileType) {
                queryRef = queryRef.where('fileType', '==', fileType);
            }

            const snapshot = await queryRef.get();
            let documents = [];
            
            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Filter by search query if provided
            if (query) {
                const searchTerm = query.toLowerCase();
                documents = documents.filter(doc => 
                    doc.filename.toLowerCase().includes(searchTerm) ||
                    doc.content.toLowerCase().includes(searchTerm) ||
                    doc.description.toLowerCase().includes(searchTerm) ||
                    doc.category.toLowerCase().includes(searchTerm) ||
                    doc.subcategory.toLowerCase().includes(searchTerm)
                );
            }

            return res.json({ documents });

        } catch (error) {
            console.error('Error searching technical database:', error);
            return res.status(500).json({ error: 'Failed to search technical database' });
        }
    });
});

exports.getTechnicalCategories = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const snapshot = await db.collection('technicalDatabase')
                .where('isActive', '==', true)
                .select('category', 'subcategory', 'fileType')
                .get();

            const categories = new Set();
            const subcategories = new Set();
            const fileTypes = new Set();

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.category) categories.add(data.category);
                if (data.subcategory) subcategories.add(data.subcategory);
                if (data.fileType) fileTypes.add(data.fileType);
            });

            return res.json({
                categories: Array.from(categories).sort(),
                subcategories: Array.from(subcategories).sort(),
                fileTypes: Array.from(fileTypes).sort()
            });
            
        } catch (error) {
            console.error('Error fetching technical categories:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    });
});

// ============================================================================
// AI SEARCH TECHNICAL DATABASE ENDPOINT
// ============================================================================

exports.aiSearchTechnicalDatabase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { query, context, imageDescription, maxResults = 5 } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Query is required' });
            }

            // Get all active technical documents
            const snapshot = await db.collection('technicalDatabase')
                .where('isActive', '==', true)
                .get();

            const documents = [];
        snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Simple scoring algorithm based on keyword matches
            const scoredDocuments = documents.map(doc => {
                let score = 0;
                const searchText = `${query} ${context || ''} ${imageDescription || ''}`.toLowerCase();
                
                // Score based on filename matches
                if (doc.filename.toLowerCase().includes(query.toLowerCase())) {
                    score += 10;
                }
                
                // Score based on content matches
                const contentMatches = (doc.content.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
                score += contentMatches * 2;
                
                // Score based on category relevance
                if (doc.category && searchText.includes(doc.category.toLowerCase())) {
                    score += 5;
                }
                
                // Score based on subcategory relevance
                if (doc.subcategory && searchText.includes(doc.subcategory.toLowerCase())) {
                    score += 3;
                }
                
                // Score based on description matches
                if (doc.description && doc.description.toLowerCase().includes(query.toLowerCase())) {
                    score += 4;
                }

                return { ...doc, relevanceScore: score };
            });

            // Sort by relevance score and return top results
            const topDocuments = scoredDocuments
                .filter(doc => doc.relevanceScore > 0)
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, maxResults);

            return res.json({
                documents: topDocuments,
                totalFound: topDocuments.length,
                query: query
            });

        } catch (error) {
            console.error('Error searching technical database with AI:', error);
            return res.status(500).json({ error: 'Failed to search technical database' });
        }
    });
});

// ============================================================================
// CASE DATABASE ENDPOINTS
// ============================================================================

// Get all cases
exports.getCases = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { category, status, limit = 50, offset = 0 } = req.query;
            
            let query = db.collection('cases');
            
            // Apply filters
            if (category) {
                query = query.where('problemCategory', '==', category);
            }
            if (status) {
                query = query.where('status', '==', status);
            }
            
            // Order by creation date (newest first)
            query = query.orderBy('createdAt', 'desc');
            
            // Apply pagination
            query = query.limit(parseInt(limit)).offset(parseInt(offset));
            
            const snapshot = await query.get();
            const cases = [];
            
            snapshot.forEach(doc => {
                cases.push({
                id: doc.id,
                    ...doc.data()
            });
        });

            return res.json({ cases });
            
        } catch (error) {
            console.error('Error fetching cases:', error);
            return res.status(500).json({ error: 'Failed to fetch cases' });
        }
    });
});

// Get single case by ID
exports.getCase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { caseId } = req.params;
            
            if (!caseId) {
                return res.status(400).json({ error: 'Case ID is required' });
            }
            
            const doc = await db.collection('cases').doc(caseId).get();
            
            if (!doc.exists) {
                return res.status(404).json({ error: 'Case not found' });
            }
            
            return res.json({
                id: doc.id,
                ...doc.data()
            });

    } catch (error) {
            console.error('Error fetching case:', error);
            return res.status(500).json({ error: 'Failed to fetch case' });
        }
    });
});

// Create new case
exports.createCase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const {
                problemDescription,
                problemCategory,
                problemSubcategory,
                solution,
                resolutionTime,
                difficulty = 'Medium',
                tags = [],
                images = [],
                createdBy = 'system'
            } = req.body;

            if (!problemDescription || !solution) {
                return res.status(400).json({ 
                    error: 'Problem description and solution are required' 
                });
            }

            const caseData = {
                problemDescription,
                problemCategory: problemCategory || 'General',
                problemSubcategory: problemSubcategory || 'General',
                solution,
                resolutionTime: resolutionTime || 'Unknown',
                difficulty,
                tags,
                images,
                successRate: 1.0, // New cases start with 100% success rate
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy,
                verifiedBy: null,
                viewCount: 0,
                successCount: 0,
                totalAttempts: 0
            };

            const docRef = await db.collection('cases').add(caseData);

            return res.json({
                id: docRef.id,
                ...caseData
            });

        } catch (error) {
            console.error('Error creating case:', error);
            return res.status(500).json({ error: 'Failed to create case' });
        }
    });
});

// Update case
exports.updateCase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { caseId } = req.params;
            const updateData = req.body;

            if (!caseId) {
                return res.status(400).json({ error: 'Case ID is required' });
            }

            // Remove fields that shouldn't be updated directly
            delete updateData.id;
            delete updateData.createdAt;
            delete updateData.createdBy;

            // Add update timestamp
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

            await db.collection('cases').doc(caseId).update(updateData);

            return res.json({ success: true });

        } catch (error) {
            console.error('Error updating case:', error);
            return res.status(500).json({ error: 'Failed to update case' });
        }
    });
});

// Delete case
exports.deleteCase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'DELETE') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { caseId } = req.params;

            if (!caseId) {
                return res.status(400).json({ error: 'Case ID is required' });
            }

            await db.collection('cases').doc(caseId).delete();

            return res.json({ success: true });

        } catch (error) {
            console.error('Error deleting case:', error);
            return res.status(500).json({ error: 'Failed to delete case' });
        }
    });
});

// Search cases with AI-powered similarity matching
exports.searchCases = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { query, category, maxResults = 10 } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Query is required' });
            }

            // Get all verified cases
            let queryRef = db.collection('cases').where('status', '==', 'verified');
            
            if (category) {
                queryRef = queryRef.where('problemCategory', '==', category);
            }

            const snapshot = await queryRef.get();
            const cases = [];

            snapshot.forEach(doc => {
                cases.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // AI-powered similarity scoring
            const scoredCases = cases.map(caseItem => {
                let score = 0;
                const searchQuery = query.toLowerCase();
                
                // Score based on problem description matches
                const problemMatches = (caseItem.problemDescription.toLowerCase().match(new RegExp(searchQuery, 'g')) || []).length;
                score += problemMatches * 3;
                
                // Score based on solution matches
                const solutionMatches = (caseItem.solution.toLowerCase().match(new RegExp(searchQuery, 'g')) || []).length;
                score += solutionMatches * 2;
                
                // Score based on tag matches
                const tagMatches = caseItem.tags.filter(tag => 
                    tag.toLowerCase().includes(searchQuery)
                ).length;
                score += tagMatches * 4;
                
                // Score based on category relevance
                if (caseItem.problemCategory.toLowerCase().includes(searchQuery)) {
                    score += 5;
                }
                
                if (caseItem.problemSubcategory.toLowerCase().includes(searchQuery)) {
                    score += 3;
                }
                
                // Boost score for high success rate cases
                score += caseItem.successRate * 2;
                
                // Boost score for frequently successful cases
                if (caseItem.totalAttempts > 0) {
                    score += (caseItem.successCount / caseItem.totalAttempts) * 3;
                }

                return { ...caseItem, similarityScore: score };
            });

            // Sort by similarity score and return top results
            const topCases = scoredCases
                .filter(caseItem => caseItem.similarityScore > 0)
                .sort((a, b) => b.similarityScore - a.similarityScore)
                .slice(0, maxResults);

            return res.json({
                cases: topCases,
                totalFound: topCases.length,
                query: query
            });

        } catch (error) {
            console.error('Error searching cases:', error);
            return res.status(500).json({ error: 'Failed to search cases' });
        }
    });
});

// Record case usage and success/failure
exports.recordCaseUsage = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { caseId, wasSuccessful, feedback } = req.body;

            if (!caseId) {
                return res.status(400).json({ error: 'Case ID is required' });
            }

            const caseRef = db.collection('cases').doc(caseId);
            const caseDoc = await caseRef.get();

            if (!caseDoc.exists) {
                return res.status(404).json({ error: 'Case not found' });
            }

            const caseData = caseDoc.data();
            const newTotalAttempts = (caseData.totalAttempts || 0) + 1;
            const newSuccessCount = (caseData.successCount || 0) + (wasSuccessful ? 1 : 0);
            const newSuccessRate = newSuccessCount / newTotalAttempts;

            await caseRef.update({
                totalAttempts: newTotalAttempts,
                successCount: newSuccessCount,
                successRate: newSuccessRate,
                lastUsed: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Add feedback if provided
            if (feedback) {
                await db.collection('caseFeedback').add({
                    caseId: caseId,
                    feedback: feedback,
                    wasSuccessful: wasSuccessful,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            return res.json({ success: true });

        } catch (error) {
            console.error('Error recording case usage:', error);
            return res.status(500).json({ error: 'Failed to record case usage' });
        }
    });
});

// ============================================================================
// CASE ANALYTICS ENDPOINTS
// ============================================================================

// Get case analytics overview
exports.getCaseAnalytics = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { timeRange = '30d' } = req.query;
            
            // Calculate date range
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Get all cases
            const casesSnapshot = await db.collection('cases').get();
            const cases = [];
            casesSnapshot.forEach(doc => {
                cases.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Calculate analytics
            const analytics = {
                totalCases: cases.length,
                verifiedCases: cases.filter(c => c.status === 'verified').length,
                pendingCases: cases.filter(c => c.status === 'pending').length,
                archivedCases: cases.filter(c => c.status === 'archived').length,
                
                // Success metrics
                totalAttempts: cases.reduce((sum, c) => sum + (c.totalAttempts || 0), 0),
                totalSuccesses: cases.reduce((sum, c) => sum + (c.successCount || 0), 0),
                averageSuccessRate: cases.length > 0 ? 
                    cases.reduce((sum, c) => sum + (c.successRate || 0), 0) / cases.length : 0,
                
                // Category breakdown
                categoryBreakdown: {},
                difficultyBreakdown: {},
                
                // Top performing cases
                topPerformingCases: [],
                
                // Recent activity
                recentActivity: [],
                
                // Trends
                dailyUsage: {},
                weeklyTrends: {}
            };

            // Category breakdown
            cases.forEach(caseItem => {
                const category = caseItem.problemCategory || 'Unknown';
                const difficulty = caseItem.difficulty || 'Unknown';
                
                if (!analytics.categoryBreakdown[category]) {
                    analytics.categoryBreakdown[category] = {
                        count: 0,
                        totalAttempts: 0,
                        totalSuccesses: 0,
                        averageSuccessRate: 0
                    };
                }
                
                if (!analytics.difficultyBreakdown[difficulty]) {
                    analytics.difficultyBreakdown[difficulty] = {
                        count: 0,
                        totalAttempts: 0,
                        totalSuccesses: 0,
                        averageSuccessRate: 0
                    };
                }
                
                analytics.categoryBreakdown[category].count++;
                analytics.categoryBreakdown[category].totalAttempts += caseItem.totalAttempts || 0;
                analytics.categoryBreakdown[category].totalSuccesses += caseItem.successCount || 0;
                
                analytics.difficultyBreakdown[difficulty].count++;
                analytics.difficultyBreakdown[difficulty].totalAttempts += caseItem.totalAttempts || 0;
                analytics.difficultyBreakdown[difficulty].totalSuccesses += caseItem.successCount || 0;
            });

            // Calculate average success rates for categories and difficulties
            Object.keys(analytics.categoryBreakdown).forEach(category => {
                const cat = analytics.categoryBreakdown[category];
                cat.averageSuccessRate = cat.totalAttempts > 0 ? cat.totalSuccesses / cat.totalAttempts : 0;
            });

            Object.keys(analytics.difficultyBreakdown).forEach(difficulty => {
                const diff = analytics.difficultyBreakdown[difficulty];
                diff.averageSuccessRate = diff.totalAttempts > 0 ? diff.totalSuccesses / diff.totalAttempts : 0;
            });

            // Top performing cases (by success rate and usage)
            analytics.topPerformingCases = cases
                .filter(c => c.totalAttempts > 0)
                .sort((a, b) => {
                    const scoreA = (a.successRate || 0) * Math.log(a.totalAttempts + 1);
                    const scoreB = (b.successRate || 0) * Math.log(b.totalAttempts + 1);
                    return scoreB - scoreA;
                })
                .slice(0, 10)
                .map(caseItem => ({
                    id: caseItem.id,
                    problemDescription: caseItem.problemDescription.substring(0, 100) + '...',
                    category: caseItem.problemCategory,
                    successRate: Math.round((caseItem.successRate || 0) * 100),
                    totalAttempts: caseItem.totalAttempts || 0,
                    score: Math.round((caseItem.successRate || 0) * Math.log((caseItem.totalAttempts || 0) + 1) * 100)
                }));

            return res.json(analytics);

        } catch (error) {
            console.error('Error getting case analytics:', error);
            return res.status(500).json({ error: 'Failed to get case analytics' });
        }
    });
});

// Get success patterns analysis
exports.getSuccessPatterns = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { category, minAttempts = 5 } = req.query;
            
            let query = db.collection('cases').where('totalAttempts', '>=', parseInt(minAttempts));
            
            if (category) {
                query = query.where('problemCategory', '==', category);
            }
            
            const snapshot = await query.get();
            const cases = [];
            
            snapshot.forEach(doc => {
                const caseData = doc.data();
                if (caseData.totalAttempts > 0) {
                    cases.push({
                        id: doc.id,
                        ...caseData
                    });
                }
            });

            // Analyze success patterns
            const patterns = {
                highSuccessCases: cases.filter(c => (c.successRate || 0) >= 0.8),
                mediumSuccessCases: cases.filter(c => (c.successRate || 0) >= 0.6 && (c.successRate || 0) < 0.8),
                lowSuccessCases: cases.filter(c => (c.successRate || 0) < 0.6),
                
                // Common solution patterns
                solutionPatterns: {},
                
                // Time-based patterns
                resolutionTimePatterns: {},
                
                // Tag analysis
                tagEffectiveness: {}
            };

            // Analyze solution patterns
            cases.forEach(caseItem => {
                const solution = caseItem.solution || '';
                const words = solution.toLowerCase().split(/\s+/);
                
                words.forEach(word => {
                    if (word.length > 3) { // Only meaningful words
                        if (!patterns.solutionPatterns[word]) {
                            patterns.solutionPatterns[word] = {
                                count: 0,
                                totalSuccessRate: 0,
                                cases: []
                            };
                        }
                        
                        patterns.solutionPatterns[word].count++;
                        patterns.solutionPatterns[word].totalSuccessRate += caseItem.successRate || 0;
                        patterns.solutionPatterns[word].cases.push(caseItem.id);
        }
    });
});

            // Calculate average success rates for solution patterns
            Object.keys(patterns.solutionPatterns).forEach(word => {
                const pattern = patterns.solutionPatterns[word];
                pattern.averageSuccessRate = pattern.totalSuccessRate / pattern.count;
            });

            // Sort by effectiveness (combination of frequency and success rate)
            const sortedPatterns = Object.entries(patterns.solutionPatterns)
                .map(([word, data]) => ({
                    word,
                    ...data,
                    effectiveness: data.count * data.averageSuccessRate
                }))
                .sort((a, b) => b.effectiveness - a.effectiveness)
                .slice(0, 20);

            patterns.topSolutionPatterns = sortedPatterns;

            // Analyze resolution time patterns
            cases.forEach(caseItem => {
                const resolutionTime = caseItem.resolutionTime || 'Unknown';
                if (!patterns.resolutionTimePatterns[resolutionTime]) {
                    patterns.resolutionTimePatterns[resolutionTime] = {
                        count: 0,
                        totalSuccessRate: 0
                    };
                }
                patterns.resolutionTimePatterns[resolutionTime].count++;
                patterns.resolutionTimePatterns[resolutionTime].totalSuccessRate += caseItem.successRate || 0;
            });

            // Calculate average success rates for resolution times
            Object.keys(patterns.resolutionTimePatterns).forEach(time => {
                const pattern = patterns.resolutionTimePatterns[time];
                pattern.averageSuccessRate = pattern.totalSuccessRate / pattern.count;
            });

            // Analyze tag effectiveness
            cases.forEach(caseItem => {
                if (caseItem.tags && Array.isArray(caseItem.tags)) {
                    caseItem.tags.forEach(tag => {
                        if (!patterns.tagEffectiveness[tag]) {
                            patterns.tagEffectiveness[tag] = {
                                count: 0,
                                totalSuccessRate: 0
                            };
                        }
                        patterns.tagEffectiveness[tag].count++;
                        patterns.tagEffectiveness[tag].totalSuccessRate += caseItem.successRate || 0;
                    });
                }
            });

            // Calculate average success rates for tags
            Object.keys(patterns.tagEffectiveness).forEach(tag => {
                const pattern = patterns.tagEffectiveness[tag];
                pattern.averageSuccessRate = pattern.totalSuccessRate / pattern.count;
            });

            return res.json(patterns);

        } catch (error) {
            console.error('Error getting success patterns:', error);
            return res.status(500).json({ error: 'Failed to get success patterns' });
        }
    });
});

// Get case trends over time
exports.getCaseTrends = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { timeRange = '30d', granularity = 'daily' } = req.query;
            
            // Calculate date range
            const now = new Date();
            let startDate;
            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Get cases created in the time range
            const casesSnapshot = await db.collection('cases')
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
                .orderBy('createdAt', 'asc')
                .get();

            const cases = [];
            casesSnapshot.forEach(doc => {
                const caseData = doc.data();
                cases.push({
                    id: doc.id,
                    ...caseData,
                    createdAt: caseData.createdAt.toDate()
                });
            });

            // Group by time period
            const trends = {
                daily: {},
                weekly: {},
                monthly: {},
                categoryTrends: {},
                difficultyTrends: {},
                successRateTrends: {}
            };

            cases.forEach(caseItem => {
                const date = caseItem.createdAt;
                const dayKey = date.toISOString().split('T')[0];
                const weekKey = getWeekKey(date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                const category = caseItem.problemCategory || 'Unknown';
                const difficulty = caseItem.difficulty || 'Unknown';
                const successRate = caseItem.successRate || 0;

                // Daily trends
                if (!trends.daily[dayKey]) {
                    trends.daily[dayKey] = {
                        cases: 0,
                        categories: {},
                        difficulties: {},
                        totalSuccessRate: 0,
                        successCount: 0
                    };
                }
                trends.daily[dayKey].cases++;
                trends.daily[dayKey].totalSuccessRate += successRate;
                trends.daily[dayKey].successCount++;
                
                if (!trends.daily[dayKey].categories[category]) {
                    trends.daily[dayKey].categories[category] = 0;
                }
                trends.daily[dayKey].categories[category]++;
                
                if (!trends.daily[dayKey].difficulties[difficulty]) {
                    trends.daily[dayKey].difficulties[difficulty] = 0;
                }
                trends.daily[dayKey].difficulties[difficulty]++;

                // Weekly trends
                if (!trends.weekly[weekKey]) {
                    trends.weekly[weekKey] = {
                        cases: 0,
                        categories: {},
                        difficulties: {},
                        totalSuccessRate: 0,
                        successCount: 0
                    };
                }
                trends.weekly[weekKey].cases++;
                trends.weekly[weekKey].totalSuccessRate += successRate;
                trends.weekly[weekKey].successCount++;

                // Monthly trends
                if (!trends.monthly[monthKey]) {
                    trends.monthly[monthKey] = {
                        cases: 0,
                        categories: {},
                        difficulties: {},
                        totalSuccessRate: 0,
                        successCount: 0
                    };
                }
                trends.monthly[monthKey].cases++;
                trends.monthly[monthKey].totalSuccessRate += successRate;
                trends.monthly[monthKey].successCount++;

                // Category trends
                if (!trends.categoryTrends[category]) {
                    trends.categoryTrends[category] = {
                        daily: {},
                        weekly: {},
                        monthly: {}
                    };
                }
                
                if (!trends.categoryTrends[category].daily[dayKey]) {
                    trends.categoryTrends[category].daily[dayKey] = 0;
                }
                trends.categoryTrends[category].daily[dayKey]++;
            });

            // Calculate average success rates
            Object.keys(trends.daily).forEach(day => {
                const dayData = trends.daily[day];
                dayData.averageSuccessRate = dayData.successCount > 0 ? dayData.totalSuccessRate / dayData.successCount : 0;
            });

            Object.keys(trends.weekly).forEach(week => {
                const weekData = trends.weekly[week];
                weekData.averageSuccessRate = weekData.successCount > 0 ? weekData.totalSuccessRate / weekData.successCount : 0;
            });

            Object.keys(trends.monthly).forEach(month => {
                const monthData = trends.monthly[month];
                monthData.averageSuccessRate = monthData.successCount > 0 ? monthData.totalSuccessRate / monthData.successCount : 0;
            });

            return res.json(trends);

        } catch (error) {
            console.error('Error getting case trends:', error);
            return res.status(500).json({ error: 'Failed to get case trends' });
        }
    });
});

// Helper function to get week key
function getWeekKey(date) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
}

// Helper function to get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================================================
// ADVANCED LEARNING FEATURES
// ============================================================================

// Advanced case similarity engine
exports.getCaseSimilarity = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { caseId, query, maxResults = 10 } = req.body;

            if (!caseId && !query) {
                return res.status(400).json({ error: 'Case ID or query is required' });
            }

            // Get all cases for comparison
            const casesSnapshot = await db.collection('cases').get();
            const allCases = [];
            casesSnapshot.forEach(doc => {
                allCases.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            let targetCase = null;
            let searchQuery = query;

            // If caseId provided, get that case for similarity comparison
            if (caseId) {
                targetCase = allCases.find(c => c.id === caseId);
                if (!targetCase) {
                    return res.status(404).json({ error: 'Case not found' });
                }
                searchQuery = targetCase.problemDescription;
            }

            // Calculate similarity scores
            const similarities = allCases
                .filter(c => c.id !== caseId) // Exclude the target case itself
                .map(caseItem => {
                    const similarity = calculateAdvancedSimilarity(searchQuery, caseItem);
                    return {
                        ...caseItem,
                        similarityScore: similarity.totalScore,
                        similarityBreakdown: similarity.breakdown
                    };
                })
                .filter(c => c.similarityScore > 0.1) // Only cases with meaningful similarity
                .sort((a, b) => b.similarityScore - a.similarityScore)
                .slice(0, maxResults);

            return res.json({
                similarities,
                targetCase: targetCase ? {
                    id: targetCase.id,
                    problemDescription: targetCase.problemDescription,
                    category: targetCase.problemCategory
                } : null
            });

        } catch (error) {
            console.error('Error calculating case similarity:', error);
            return res.status(500).json({ error: 'Failed to calculate similarity' });
        }
    });
});

// Calculate advanced similarity between two cases
function calculateAdvancedSimilarity(query, caseItem) {
    const queryText = query.toLowerCase();
    const caseText = caseItem.problemDescription.toLowerCase();
    const caseSolution = (caseItem.solution || '').toLowerCase();
    const caseTags = (caseItem.tags || []).map(tag => tag.toLowerCase());
    const caseCategory = (caseItem.problemCategory || '').toLowerCase();

    const breakdown = {
        textSimilarity: 0,
        keywordSimilarity: 0,
        categorySimilarity: 0,
        tagSimilarity: 0,
        solutionSimilarity: 0,
        successRateBonus: 0
    };

    // 1. Text similarity (Levenshtein distance based)
    breakdown.textSimilarity = calculateTextSimilarity(queryText, caseText);

    // 2. Keyword similarity
    const queryKeywords = extractKeywords(queryText);
    const caseKeywords = extractKeywords(caseText);
    breakdown.keywordSimilarity = calculateKeywordSimilarity(queryKeywords, caseKeywords);

    // 3. Category similarity
    const queryCategory = extractCategoryFromText(queryText);
    if (queryCategory && caseCategory) {
        breakdown.categorySimilarity = queryCategory === caseCategory ? 1.0 : 0.0;
    }

    // 4. Tag similarity
    if (caseTags.length > 0) {
        const queryTags = extractTagsFromText(queryText);
        breakdown.tagSimilarity = calculateTagSimilarity(queryTags, caseTags);
    }

    // 5. Solution similarity (if query mentions solution terms)
    if (queryText.includes('solution') || queryText.includes('fix') || queryText.includes('resolve')) {
        breakdown.solutionSimilarity = calculateTextSimilarity(queryText, caseSolution);
    }

    // 6. Success rate bonus
    const successRate = caseItem.successRate || 0;
    breakdown.successRateBonus = successRate * 0.2; // 20% bonus for high success rate

    // Calculate weighted total score
    const totalScore = (
        breakdown.textSimilarity * 0.3 +
        breakdown.keywordSimilarity * 0.25 +
        breakdown.categorySimilarity * 0.2 +
        breakdown.tagSimilarity * 0.15 +
        breakdown.solutionSimilarity * 0.05 +
        breakdown.successRateBonus * 0.05
    );

    return {
        totalScore: Math.min(totalScore, 1.0), // Cap at 1.0
        breakdown
    };
}

// Calculate text similarity using Jaccard similarity
function calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

// Extract keywords from text
function extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    return text.split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
        .map(word => word.toLowerCase().replace(/[^\w]/g, ''));
}

// Calculate keyword similarity
function calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

// Extract category from text
function extractCategoryFromText(text) {
    const categoryKeywords = {
        'battery': ['battery', 'charge', 'charging', 'power', 'energy', 'voltage'],
        'charging': ['charging', 'charger', 'plug', 'socket', 'cable', 'adapter'],
        'software': ['software', 'update', 'firmware', 'app', 'system', 'program'],
        'hardware': ['hardware', 'component', 'part', 'sensor', 'motor', 'mechanical'],
        'performance': ['performance', 'speed', 'acceleration', 'range', 'efficiency'],
        'general': ['general', 'other', 'misc', 'unknown']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }
    
    return null;
}

// Extract tags from text
function extractTagsFromText(text) {
    const commonTags = ['urgent', 'critical', 'minor', 'major', 'electrical', 'mechanical', 'software', 'hardware', 'warranty', 'repair', 'maintenance'];
    return commonTags.filter(tag => text.includes(tag));
}

// Calculate tag similarity
function calculateTagSimilarity(tags1, tags2) {
    if (tags1.length === 0 || tags2.length === 0) return 0;
    
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

// Get solution templates
exports.getSolutionTemplates = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { category, difficulty } = req.query;
            
            // Get cases with high success rates to use as templates
            let query = db.collection('cases')
                .where('successRate', '>=', 0.8)
                .where('totalAttempts', '>=', 3);
            
            if (category) {
                query = query.where('problemCategory', '==', category);
            }
            
            if (difficulty) {
                query = query.where('difficulty', '==', difficulty);
            }
            
            const snapshot = await query.limit(20).get();
            const cases = [];
            
            snapshot.forEach(doc => {
                const caseData = doc.data();
                cases.push({
                    id: doc.id,
                    ...caseData
                });
            });
            
            // Generate templates from successful cases
            const templates = generateSolutionTemplates(cases);
            
            return res.json({ templates });

        } catch (error) {
            console.error('Error getting solution templates:', error);
            return res.status(500).json({ error: 'Failed to get solution templates' });
        }
    });
});

// Generate solution templates from successful cases
function generateSolutionTemplates(cases) {
    const templates = [];
    
    // Group cases by category
    const categoryGroups = {};
    cases.forEach(caseItem => {
        const category = caseItem.problemCategory || 'General';
        if (!categoryGroups[category]) {
            categoryGroups[category] = [];
        }
        categoryGroups[category].push(caseItem);
    });
    
    // Generate templates for each category
    Object.entries(categoryGroups).forEach(([category, categoryCases]) => {
        if (categoryCases.length >= 2) {
            const template = {
                id: `template_${category.toLowerCase()}`,
                category: category,
                title: `${category} Problem Template`,
                description: `Common solution patterns for ${category} problems`,
                steps: extractCommonSteps(categoryCases),
                keywords: extractCommonKeywords(categoryCases),
                successRate: calculateAverageSuccessRate(categoryCases),
                usageCount: categoryCases.length,
                lastUpdated: new Date().toISOString()
            };
            
            templates.push(template);
        }
    });
    
    return templates;
}

// Extract common solution steps from cases
function extractCommonSteps(cases) {
    const allSteps = [];
    
    cases.forEach(caseItem => {
        const solution = caseItem.solution || '';
        const steps = solution.split(/[.!?]+/)
            .map(step => step.trim())
            .filter(step => step.length > 10)
            .slice(0, 5); // Take first 5 steps
        
        allSteps.push(...steps);
    });
    
    // Find most common steps
    const stepCounts = {};
    allSteps.forEach(step => {
        const normalizedStep = step.toLowerCase().trim();
        if (normalizedStep.length > 10) {
            stepCounts[normalizedStep] = (stepCounts[normalizedStep] || 0) + 1;
        }
    });
    
    return Object.entries(stepCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([step, count]) => ({
            step: step,
            frequency: count
        }));
}

// Extract common keywords from cases
function extractCommonKeywords(cases) {
    const allKeywords = [];
    
    cases.forEach(caseItem => {
        const text = `${caseItem.problemDescription} ${caseItem.solution || ''}`.toLowerCase();
        const keywords = extractKeywords(text);
        allKeywords.push(...keywords);
    });
    
    const keywordCounts = {};
    allKeywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    return Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({
            keyword: keyword,
            frequency: count
        }));
}

// Calculate average success rate
function calculateAverageSuccessRate(cases) {
    if (cases.length === 0) return 0;
    const total = cases.reduce((sum, caseItem) => sum + (caseItem.successRate || 0), 0);
    return total / cases.length;
}

// Auto-categorize new case
exports.autoCategorizeCase = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { problemDescription, solution, tags } = req.body;
            
            if (!problemDescription) {
                return res.status(400).json({ error: 'Problem description is required' });
            }
            
            const categorization = await categorizeCase(problemDescription, solution, tags);
            
            return res.json(categorization);

        } catch (error) {
            console.error('Error auto-categorizing case:', error);
            return res.status(500).json({ error: 'Failed to categorize case' });
        }
    });
});

// Categorize case using AI and pattern matching
async function categorizeCase(problemDescription, solution = '', tags = []) {
    const text = `${problemDescription} ${solution}`.toLowerCase();
    
    // Category scoring
    const categoryScores = {
        'Battery': 0,
        'Charging': 0,
        'Software': 0,
        'Hardware': 0,
        'Performance': 0,
        'General': 0
    };
    
    // Battery keywords
    const batteryKeywords = ['battery', 'charge', 'charging', 'power', 'energy', 'voltage', 'amp', 'mah', 'cell', 'lithium'];
    batteryKeywords.forEach(keyword => {
        if (text.includes(keyword)) categoryScores.Battery += 1;
    });
    
    // Charging keywords
    const chargingKeywords = ['charger', 'plug', 'socket', 'cable', 'adapter', 'charging station', 'wallbox', 'dc', 'ac'];
    chargingKeywords.forEach(keyword => {
        if (text.includes(keyword)) categoryScores.Charging += 1;
    });
    
    // Software keywords
    const softwareKeywords = ['software', 'update', 'firmware', 'app', 'system', 'program', 'code', 'bug', 'glitch', 'interface'];
    softwareKeywords.forEach(keyword => {
        if (text.includes(keyword)) categoryScores.Software += 1;
    });
    
    // Hardware keywords
    const hardwareKeywords = ['hardware', 'component', 'part', 'sensor', 'motor', 'mechanical', 'physical', 'broken', 'damaged'];
    hardwareKeywords.forEach(keyword => {
        if (text.includes(keyword)) categoryScores.Hardware += 1;
    });
    
    // Performance keywords
    const performanceKeywords = ['performance', 'speed', 'acceleration', 'range', 'efficiency', 'slow', 'fast', 'optimization'];
    performanceKeywords.forEach(keyword => {
        if (text.includes(keyword)) categoryScores.Performance += 1;
    });
    
    // Find best category
    const bestCategory = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)[0][0];
    
    // Difficulty assessment
    const difficulty = assessDifficulty(problemDescription, solution);
    
    // Subcategory suggestion
    const subcategory = suggestSubcategory(bestCategory, text);
    
    // Confidence score
    const maxScore = Math.max(...Object.values(categoryScores));
    const confidence = maxScore > 0 ? Math.min(maxScore / 5, 1.0) : 0.3;
    
    return {
        category: bestCategory,
        subcategory: subcategory,
        difficulty: difficulty,
        confidence: confidence,
        scores: categoryScores,
        suggestedTags: generateSuggestedTags(text, bestCategory)
    };
}

// Assess difficulty level
function assessDifficulty(problemDescription, solution) {
    const text = `${problemDescription} ${solution}`.toLowerCase();
    
    // High difficulty indicators
    const highDifficultyKeywords = ['complex', 'advanced', 'technical', 'specialist', 'expert', 'diagnostic', 'repair', 'replace'];
    const highDifficultyCount = highDifficultyKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Medium difficulty indicators
    const mediumDifficultyKeywords = ['adjust', 'configure', 'setting', 'calibrate', 'troubleshoot'];
    const mediumDifficultyCount = mediumDifficultyKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Low difficulty indicators
    const lowDifficultyKeywords = ['simple', 'easy', 'basic', 'reset', 'restart', 'check'];
    const lowDifficultyCount = lowDifficultyKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (highDifficultyCount >= 2) return 'Hard';
    if (mediumDifficultyCount >= 1) return 'Medium';
    if (lowDifficultyCount >= 1) return 'Easy';
    
    // Default based on text length and complexity
    const wordCount = problemDescription.split(' ').length;
    if (wordCount > 50) return 'Hard';
    if (wordCount > 20) return 'Medium';
    return 'Easy';
}

// Suggest subcategory
function suggestSubcategory(category, text) {
    const subcategories = {
        'Battery': ['Capacity', 'Charging Speed', 'Temperature', 'Lifecycle', 'Replacement'],
        'Charging': ['AC Charging', 'DC Fast Charging', 'Home Charging', 'Public Charging', 'Cable Issues'],
        'Software': ['Updates', 'Interface', 'Connectivity', 'Apps', 'System Errors'],
        'Hardware': ['Sensors', 'Motors', 'Displays', 'Physical Damage', 'Wear and Tear'],
        'Performance': ['Acceleration', 'Range', 'Efficiency', 'Speed', 'Optimization'],
        'General': ['Maintenance', 'Warranty', 'Documentation', 'Support', 'Other']
    };
    
    const categorySubs = subcategories[category] || [];
    
    // Simple keyword matching for subcategory
    for (const sub of categorySubs) {
        if (text.includes(sub.toLowerCase())) {
            return sub;
        }
    }
    
    return categorySubs[0] || 'General';
}

// Generate suggested tags
function generateSuggestedTags(text, category) {
    const commonTags = ['urgent', 'critical', 'minor', 'major', 'electrical', 'mechanical', 'software', 'hardware', 'warranty', 'repair', 'maintenance'];
    const categoryTags = {
        'Battery': ['battery', 'power', 'energy'],
        'Charging': ['charging', 'electrical', 'power'],
        'Software': ['software', 'digital', 'interface'],
        'Hardware': ['hardware', 'mechanical', 'physical'],
        'Performance': ['performance', 'optimization', 'efficiency'],
        'General': ['general', 'support', 'documentation']
    };
    
    const suggested = [];
    
    // Add common tags that match
    commonTags.forEach(tag => {
        if (text.includes(tag)) {
            suggested.push(tag);
        }
    });
    
    // Add category-specific tags
    if (categoryTags[category]) {
        categoryTags[category].forEach(tag => {
            if (text.includes(tag) && !suggested.includes(tag)) {
                suggested.push(tag);
            }
        });
    }
    
    return suggested.slice(0, 5); // Limit to 5 tags
}

// Download document endpoint
exports.downloadDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { docId, type } = req.query;
            
            if (!docId || !type) {
                return res.status(400).json({ error: 'Missing docId or type parameter' });
            }
            
            console.log('📥 Download request:', { docId, type });
            
            // Determine collection based on type
            const collection = type === 'technical' ? 'technicalDatabase' : 'knowledgebase';
            
            // Get document from Firestore
            const docRef = db.collection(collection).doc(docId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Document not found' });
            }
            
            const docData = docSnap.data();
            
            // Check if document has file content
            if (!docData.content && !docData.originalFileData) {
                return res.status(404).json({ error: 'Document content not available' });
            }
            
            // Set appropriate headers for download
            const filename = docData.filename || docData.name || 'document';
            const contentType = getContentType(docData.fileType || docData.type);
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            // For PDFs, use originalFileData if available, otherwise use content
            let fileContent;
            if (docData.fileType === 'pdf' && (docData.originalFileData || docData.originalPdfData)) {
                // Use original binary PDF data
                const pdfData = docData.originalFileData || docData.originalPdfData;
                fileContent = Buffer.from(pdfData, 'base64');
                res.setHeader('Content-Length', fileContent.length);
            } else {
                // Use text content for other file types
                fileContent = Buffer.from(docData.content, 'base64');
                res.setHeader('Content-Length', fileContent.length);
            }
            
            // Send the file content
            res.send(fileContent);
            
        } catch (error) {
            console.error('❌ Download error:', error);
            res.status(500).json({ error: 'Download failed', details: error.message });
        }
    });
});

// Helper function to check if a string is base64
function isBase64(str) {
    if (!str || typeof str !== 'string') return false;
    // Base64 strings should only contain these characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    // Check if it matches base64 pattern and length is multiple of 4
    return base64Regex.test(str) && str.length % 4 === 0 && str.length > 100;
}

// View document endpoint (for preview)
exports.viewDocument = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { docId, type } = req.query;
            
            if (!docId || !type) {
                return res.status(400).json({ error: 'Missing docId or type parameter' });
            }
            
            console.log('👁️ View request:', { docId, type });
            
            // Determine collection based on type
            const collection = type === 'technical' ? 'technicalDatabase' : 'knowledgebase';
            console.log('📂 Collection:', collection);
            
            // Get document from Firestore
            const docRef = db.collection(collection).doc(docId);
            const docSnap = await docRef.get();
            
            console.log('📝 Document exists:', docSnap.exists);
            
            if (!docSnap.exists) {
                console.error('❌ Document not found in collection:', collection, 'with ID:', docId);
                return res.status(404).json({ error: 'Document not found', collection, docId });
            }
            
            const docData = docSnap.data();
            console.log('📊 Document data keys:', Object.keys(docData));
            console.log('📊 File type:', docData.fileType || docData.type);
            console.log('📊 Has content:', !!docData.content);
            console.log('📊 Has originalFileData:', !!docData.originalFileData);
            console.log('📊 Has downloadURL:', !!docData.downloadURL);
            
            // If document has a downloadURL, redirect to it
            if (docData.downloadURL) {
                console.log('✅ Redirecting to downloadURL:', docData.downloadURL);
                return res.redirect(docData.downloadURL);
            }
            
            // Check if document has file content
            if (!docData.content && !docData.originalFileData && !docData.originalPdfData) {
                console.error('❌ No content available. Document fields:', Object.keys(docData));
                return res.status(404).json({ 
                    error: 'Document content not available',
                    availableFields: Object.keys(docData),
                    filename: docData.filename || docData.name
                });
            }
            
            // Set appropriate headers for viewing (inline)
            const filename = docData.filename || docData.name || 'document';
            const contentType = getContentType(docData.fileType || docData.type);
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            
            // For PDFs, use originalFileData if available, otherwise use content
            let fileContent;
            const fileType = (docData.fileType || docData.type || '').toLowerCase();
            
            if (fileType === 'pdf' && (docData.originalFileData || docData.originalPdfData)) {
                // Use original binary PDF data
                const pdfData = docData.originalFileData || docData.originalPdfData;
                try {
                    fileContent = Buffer.from(pdfData, 'base64');
                    res.setHeader('Content-Length', fileContent.length);
                    console.log('✅ Sending PDF from originalFileData, size:', fileContent.length);
                } catch (error) {
                    console.error('❌ Error decoding PDF data:', error);
                    return res.status(500).json({ error: 'Failed to decode PDF data' });
                }
            } else if (docData.content) {
                // Check if content is base64 or plain text
                try {
                    // Try to decode as base64 first
                    if (isBase64(docData.content)) {
                        fileContent = Buffer.from(docData.content, 'base64');
                        console.log('✅ Sending base64-decoded content, size:', fileContent.length);
                    } else {
                        // It's plain text, send as-is
                        fileContent = Buffer.from(docData.content, 'utf-8');
                        console.log('✅ Sending plain text content, size:', fileContent.length);
                    }
                    res.setHeader('Content-Length', fileContent.length);
                } catch (error) {
                    console.error('❌ Error processing content:', error);
                    // Fallback: send as plain text
                    fileContent = Buffer.from(docData.content, 'utf-8');
                    res.setHeader('Content-Length', fileContent.length);
                    console.log('⚠️ Sending content as plain text fallback, size:', fileContent.length);
                }
            } else {
                console.error('❌ No valid content to send');
                return res.status(404).json({ error: 'No valid content found' });
            }
            
            // Send the file content
            res.send(fileContent);
            
        } catch (error) {
            console.error('❌ View error:', error);
            res.status(500).json({ error: 'View failed', details: error.message });
        }
    });
});

// ========================================
// IMAGE RECOGNITION & INDEXING SYSTEM
// ========================================

// Extract and index images from uploaded documents
exports.indexDocumentImages = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { docId, type } = req.body;
            
            if (!docId || !type) {
                return res.status(400).json({ error: 'Missing docId or type parameter' });
            }
            
            console.log('🖼️ Indexing images for document:', { docId, type });
            
            // Determine collection
            const collection = type === 'technical' ? 'technicalDatabase' : 'knowledgeBase';
            
            // Get document
            const docRef = db.collection(collection).doc(docId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Document not found' });
            }
            
            const docData = docSnap.data();
            const indexedImages = [];
            
            console.log(`📄 Processing document: ${docData.filename} (${docData.fileType})`);
            console.log(`   - Has originalFileData: ${!!docData.originalFileData}`);
            console.log(`   - Has originalPdfData: ${!!docData.originalPdfData}`);
            
            // Extract images from document
            const images = await extractImagesFromDocument(docData);
            
            if (images.length > 0) {
                // Analyze each image
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    const analysis = await analyzeImageWithVision(image.buffer);
                    
                    // Store in imageIndex collection
                    const imageRef = await db.collection('imageIndex').add({
                        documentId: docId,
                        documentName: docData.filename,
                        documentType: docData.fileType,
                        collection: collection,
                        vehicleType: docData.vehicleType || docData.subcategory || 'General',
                        manualType: docData.manualType || docData.category || 'GENERAL',
                        pageNumber: i + 1,
                        imageData: image.buffer.toString('base64'),
                        analysis: analysis,
                        indexedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    
                    indexedImages.push({
                        imageId: imageRef.id,
                        pageNumber: i + 1,
                        analysis: analysis
                    });
                }
                
                console.log(`✅ Indexed ${images.length} images from ${docData.filename}`);
            } else {
                console.log(`⚠️ No images extracted from ${docData.filename}`);
            }
            
            console.log('✅ Document images indexed:', indexedImages.length);
            
            return res.json({
                success: true,
                docId,
                imagesIndexed: indexedImages.length,
                images: indexedImages
            });
            
        } catch (error) {
            console.error('❌ Image indexing error:', error);
            res.status(500).json({ error: 'Image indexing failed', details: error.message });
        }
    });
});

// Analyze uploaded image and find matching solutions

// Analyze image with OpenAI Vision API
async function analyzeImageWithVision(imageBase64) {
    try {
        // Ensure proper base64 format
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analysiere dieses Bild detailliert. Beschreibe:
1. Welches Fahrzeug-Dashboard oder Teil ist zu sehen?
2. Welche Warnzeichen, Symbole oder Indikatoren sind sichtbar? (z.B. Ausrufezeichen, Batteriesymbol, Temperatursymbol, etc.)
3. Welche Farben haben die Symbole? (Rot, Gelb, Grün, etc.)
4. Welche spezifischen Formen oder geometrische Muster sind erkennbar?
5. Gibt es Text oder Zahlen?
6. Was ist der wahrscheinliche Kontext oder das Problem?

Gib eine strukturierte, detaillierte Beschreibung auf Deutsch.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });
        
        const analysis = response.choices[0].message.content;
        
        // Extract key features for matching
        const features = extractKeyFeatures(analysis);
        
        return {
            fullDescription: analysis,
            features: features,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Vision API error:', error);
        throw error;
    }
}

// Extract key features from analysis for matching
function extractKeyFeatures(analysis) {
    const features = {
        symbols: [],
        colors: [],
        shapes: [],
        keywords: []
    };
    
    const lowerAnalysis = analysis.toLowerCase();
    
    // Common warning symbols
    const symbolPatterns = [
        'ausrufezeichen', 'warndreieck', 'batterie', 'temperatur', 
        'motor', 'öl', 'bremse', 'airbag', 'reifen', 'abs',
        'check engine', 'service', 'wartung', 'fehler'
    ];
    
    symbolPatterns.forEach(pattern => {
        if (lowerAnalysis.includes(pattern)) {
            features.symbols.push(pattern);
        }
    });
    
    // Colors
    const colorPatterns = ['rot', 'gelb', 'orange', 'grün', 'blau', 'weiß'];
    colorPatterns.forEach(color => {
        if (lowerAnalysis.includes(color)) {
            features.colors.push(color);
        }
    });
    
    // Shapes
    const shapePatterns = ['dreieck', 'kreis', 'quadrat', 'pfeil', 'linie'];
    shapePatterns.forEach(shape => {
        if (lowerAnalysis.includes(shape)) {
            features.shapes.push(shape);
        }
    });
    
    return features;
}

// Find matching images in index
async function findMatchingImagesInIndex(imageAnalysis) {
    try {
        // Query the imageIndex collection
        const indexSnapshot = await db.collection('imageIndex')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        
        const matches = [];
        
        indexSnapshot.forEach(doc => {
            const indexedImage = doc.data();
            const similarity = calculateSimilarity(imageAnalysis.features, indexedImage.features);
            
            if (similarity > 0.3) { // 30% similarity threshold
                matches.push({
                    id: doc.id,
                    ...indexedImage,
                    similarity: similarity
                });
            }
        });
        
        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);
        
        return matches.slice(0, 5); // Top 5 matches
        
    } catch (error) {
        console.error('❌ Error finding matches:', error);
        return [];
    }
}

// Calculate similarity between two feature sets
function calculateSimilarity(features1, features2) {
    let score = 0;
    let total = 0;
    
    // Compare symbols
    if (features1.symbols && features2.symbols) {
        const commonSymbols = features1.symbols.filter(s => features2.symbols.includes(s));
        score += commonSymbols.length * 3; // Symbols are very important
        total += Math.max(features1.symbols.length, features2.symbols.length) * 3;
    }
    
    // Compare colors
    if (features1.colors && features2.colors) {
        const commonColors = features1.colors.filter(c => features2.colors.includes(c));
        score += commonColors.length * 2; // Colors are important
        total += Math.max(features1.colors.length, features2.colors.length) * 2;
    }
    
    // Compare shapes
    if (features1.shapes && features2.shapes) {
        const commonShapes = features1.shapes.filter(s => features2.shapes.includes(s));
        score += commonShapes.length * 1; // Shapes are less important
        total += Math.max(features1.shapes.length, features2.shapes.length) * 1;
    }
    
    return total > 0 ? score / total : 0;
}

// Get solutions from matched documents
async function getSolutionsFromMatches(matches) {
    const solutions = [];
    
    for (const match of matches) {
        if (match.documentId && match.solutionPage) {
            try {
                // Get the source document
                const docRef = db.collection(match.collection || 'technicalDatabase').doc(match.documentId);
                const docSnap = await docRef.get();
                
                if (docSnap.exists) {
                    const docData = docSnap.data();
                    solutions.push({
                        documentName: docData.filename || docData.name,
                        page: match.solutionPage,
                        solution: match.solution || 'Siehe Dokument für Details',
                        similarity: match.similarity,
                        imageDescription: match.description
                    });
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }
    }
    
    return solutions;
}

// Generate comprehensive troubleshooting response
async function generateTroubleshootingResponse(imageAnalysis, solutions, vehicleModel, userDescription) {
    try {
        let prompt = `Du bist ein Experte für Cadillac Elektrofahrzeuge. 

Bildanalyse: ${imageAnalysis.fullDescription}

Fahrzeugmodell: ${vehicleModel || 'Nicht angegeben'}
Benutzerbeschreibung: ${userDescription || 'Keine zusätzliche Beschreibung'}

`;

        if (solutions.length > 0) {
            prompt += `\nGefundene passende Lösungen aus der technischen Dokumentation:\n`;
            solutions.forEach((sol, idx) => {
                prompt += `${idx + 1}. ${sol.documentName} (Seite ${sol.page}): ${sol.solution}\n`;
            });
        }
        
        prompt += `\nErstelle eine detaillierte Diagnose mit:
1. Identifiziertes Problem
2. Schweregrad (niedrig/mittel/hoch/kritisch)
3. Sicherheitswarnung (falls relevant)
4. Sofortige Maßnahmen
5. Schritt-für-Schritt-Lösung
6. Relevante Dokumente

Format: JSON mit den Feldern: problemIdentified, severity, safetyWarning, immediateAction, stepByStepSolution, relevantDocuments`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Du bist ein Experte für Cadillac EV Diagnose und Problemlösung. Antworte auf Deutsch und im angegebenen JSON-Format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
        });
        
        return JSON.parse(response.choices[0].message.content);
        
    } catch (error) {
        console.error('❌ Error generating response:', error);
        
        // Fallback response
        return {
            problemIdentified: "Bildanalyse durchgeführt",
            severity: "mittel",
            safetyWarning: null,
            immediateAction: "Fahrzeughandbuch konsultieren",
            stepByStepSolution: imageAnalysis.fullDescription,
            relevantDocuments: solutions
        };
    }
}

// Helper function to determine content type
function getContentType(fileType) {
    const typeMap = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'xls': 'application/vnd.ms-excel'
    };
    
    return typeMap[fileType?.toLowerCase()] || 'application/octet-stream';
}

// ============================================================================
// GOOGLE CLOUD VISION API & IMAGE ANALYSIS FUNCTIONS
// ============================================================================

// Scheduled function to re-index all images daily
exports.scheduledImageReindex = functions.pubsub.schedule('0 2 * * *').timeZone('Europe/Berlin').onRun(async (context) => {
    console.log('🔄 Starting scheduled image re-indexing...');
    
    try {
        // Get all documents from both collections
        const [knowledgeBaseSnapshot, technicalSnapshot] = await Promise.all([
            db.collection('knowledgeBase').where('isActive', '==', true).get(),
            db.collection('technicalDatabase').where('isActive', '==', true).get()
        ]);

        const allDocuments = [];
        knowledgeBaseSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'knowledgeBase' }));
        technicalSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'technicalDatabase' }));

        console.log(`📄 Found ${allDocuments.length} documents to re-index`);

        let indexedCount = 0;
        let errorCount = 0;

        for (const doc of allDocuments) {
            try {
                // Check if document has images (PDFs, images, etc.)
                if (doc.fileType && ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(doc.fileType.toLowerCase())) {
                    console.log(`🔍 Re-indexing document: ${doc.filename || doc.name}`);
                    
                    // Extract images from document
                    const images = await extractImagesFromDocument(doc);
                    
                    if (images.length > 0) {
                        // Delete existing indexed images for this document
                        const existingImages = await db.collection('imageIndex')
                            .where('documentId', '==', doc.id)
                            .get();
                        
                        const deletePromises = existingImages.docs.map(doc => doc.ref.delete());
                        await Promise.all(deletePromises);
                        
                        // Analyze each image
                        for (let i = 0; i < images.length; i++) {
                            const image = images[i];
                            const analysis = await analyzeImageWithVision(image.buffer);
                            
                            // Store in imageIndex collection
                            await db.collection('imageIndex').add({
                                documentId: doc.id,
                                documentName: doc.filename || doc.name,
                                documentType: doc.fileType,
                                collection: doc.collection,
                                vehicleType: doc.vehicleType || 'General',
                                manualType: doc.manualType || doc.category || 'GENERAL',
                                pageNumber: i + 1,
                                imageData: image.buffer.toString('base64'),
                                analysis: analysis,
                                indexedAt: admin.firestore.FieldValue.serverTimestamp()
                            });
                        }
                        
                        console.log(`✅ Re-indexed ${images.length} images from ${doc.filename || doc.name}`);
                        indexedCount += images.length;
                    }
                }
            } catch (error) {
                console.error(`❌ Error re-indexing document ${doc.filename || doc.name}:`, error);
                errorCount++;
            }
        }

        console.log(`✅ Scheduled re-indexing completed: ${indexedCount} images indexed, ${errorCount} errors`);
        return null;

    } catch (error) {
        console.error('❌ Error in scheduled re-indexing:', error);
        return null;
    }
});

// Initialize image indexing on app startup
exports.initializeImageIndexing = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('🚀 Starting initial image indexing...');
            
            // Get all documents from both collections
            const [knowledgeBaseSnapshot, technicalSnapshot] = await Promise.all([
                db.collection('knowledgeBase').where('isActive', '==', true).get(),
                db.collection('technicalDatabase').where('isActive', '==', true).get()
            ]);

            const allDocuments = [];
            knowledgeBaseSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'knowledgeBase' }));
            technicalSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'technicalDatabase' }));

            console.log(`📄 Found ${allDocuments.length} documents to index`);

            let indexedCount = 0;
            let errorCount = 0;

            for (const doc of allDocuments) {
                try {
                    // Check if document has images (PDFs, images, etc.)
                    if (doc.fileType && (doc.fileType.toLowerCase() === 'image' || doc.fileType.toLowerCase() === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(doc.fileType.toLowerCase()))) {
                        console.log(`🔍 Processing document: ${doc.filename || doc.name}`);
                        
                        // Extract images from document
                        const images = await extractImagesFromDocument(doc);
                        
                        if (images.length > 0) {
                            // Analyze each image
                            for (let i = 0; i < images.length; i++) {
                                const image = images[i];
                                const analysis = await analyzeImageWithVision(image.buffer);
                                
                                // Store in imageIndex collection
                                await db.collection('imageIndex').add({
                                    documentId: doc.id,
                                    documentName: doc.filename || doc.name,
                                    documentType: doc.fileType,
                                    collection: doc.collection,
                                    vehicleType: doc.vehicleType || 'General',
                                    manualType: doc.manualType || doc.category || 'GENERAL',
                                    pageNumber: i + 1,
                                    imageData: image.buffer.toString('base64'),
                                    analysis: analysis,
                                    indexedAt: admin.firestore.FieldValue.serverTimestamp()
                                });
                            }
                            
                            console.log(`✅ Indexed ${images.length} images from ${doc.filename || doc.name}`);
                            indexedCount += images.length;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing document ${doc.filename || doc.name}:`, error);
                    errorCount++;
                }
            }

            return res.json({
                success: true,
                message: `Initial image indexing completed`,
                totalDocuments: allDocuments.length,
                imagesIndexed: indexedCount,
                errors: errorCount
            });

        } catch (error) {
            console.error('❌ Error in initial image indexing:', error);
            return res.status(500).json({ 
                error: 'Failed to initialize image indexing',
                details: error.message 
            });
        }
    });
});

// Analyze uploaded image using Google Cloud Vision API
exports.analyzeUploadedImage = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { imageData, vehicleModel, problemDescription } = req.body;
            
            if (!imageData) {
                return res.status(400).json({ error: 'No image data provided' });
            }

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(imageData, 'base64');
            
            // Analyze image with Google Cloud Vision API
            const [result] = await visionClient.annotateImage({
                image: { content: imageBuffer },
                features: [
                    { type: 'LABEL_DETECTION', maxResults: 10 },
                    { type: 'TEXT_DETECTION', maxResults: 10 },
                    { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                    { type: 'WEB_DETECTION', maxResults: 10 }
                ]
            });

            // Extract analysis results
            const labels = result.labelAnnotations || [];
            const texts = result.textAnnotations || [];
            const objects = result.localizedObjectAnnotations || [];
            const webEntities = result.webDetection?.webEntities || [];

            // Create comprehensive image analysis
            const imageAnalysis = {
                labels: labels.map(label => ({
                    description: label.description,
                    score: label.score,
                    confidence: Math.round(label.score * 100)
                })),
                texts: texts.map(text => ({
                    description: text.description,
                    confidence: Math.round(text.score * 100)
                })),
                objects: objects.map(obj => ({
                    name: obj.name,
                    score: obj.score,
                    confidence: Math.round(obj.score * 100)
                })),
                webEntities: webEntities.map(entity => ({
                    description: entity.description,
                    score: entity.score
                })),
                fullDescription: generateImageDescription(labels, texts, objects, webEntities)
            };

            // Skip expensive database operations for now - just return basic analysis
            const matchingDocs = [];
            
            // Generate simple solution without Gemini API call
            const solution = {
                problemIdentified: "Bildanalyse durchgeführt - manuelle Überprüfung erforderlich",
                severity: "mittel",
                safetyWarning: "Bei Unsicherheit Fachwerkstatt kontaktieren",
                immediateAction: "Fahrzeughandbuch konsultieren",
                stepByStepSolution: [
                    {
                        step: 1,
                        title: "Problem identifizieren",
                        description: imageAnalysis.fullDescription || "Bildanalyse durchgeführt",
                        tools: ["Fahrzeughandbuch", "Multimeter (falls elektrisch)"],
                        time: "5-10 Minuten",
                        difficulty: "einfach"
                    },
                    {
                        step: 2,
                        title: "Fachwerkstatt kontaktieren",
                        description: "Bei komplexen Problemen professionelle Hilfe in Anspruch nehmen",
                        tools: ["Telefon", "Fahrzeughandbuch"],
                        time: "15-30 Minuten",
                        difficulty: "einfach"
                    }
                ],
                preventionTips: [
                    "Regelmäßige Wartung durchführen",
                    "Warnleuchten sofort beachten"
                ],
                relatedDocuments: [
                    "Fahrzeughandbuch",
                    "Wartungsanleitung"
                ],
                estimatedCost: "Je nach Problem"
            };

            return res.json({
                success: true,
                analysis: imageAnalysis,
                matchingDocuments: matchingDocs,
                solution: solution
            });

        } catch (error) {
            console.error('❌ Error analyzing image:', error);
            return res.status(500).json({ 
                error: 'Failed to analyze image',
                details: error.message 
            });
        }
    });
});

// Index all images from database documents
exports.indexAllImages = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('🔄 Starting image indexing process...');
            
            // Get all documents from both collections
            const [knowledgeBaseSnapshot, technicalSnapshot] = await Promise.all([
                db.collection('knowledgeBase').where('isActive', '==', true).get(),
                db.collection('technicalDatabase').where('isActive', '==', true).get()
            ]);

            const allDocuments = [];
            knowledgeBaseSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'knowledgeBase' }));
            technicalSnapshot.forEach(doc => allDocuments.push({ ...doc.data(), id: doc.id, collection: 'technicalDatabase' }));

            console.log(`📄 Found ${allDocuments.length} documents to process`);

            let indexedCount = 0;
            let errorCount = 0;

            for (const doc of allDocuments) {
                try {
                    console.log(`📄 Checking document: ${doc.filename || doc.name} (${doc.fileType})`);
                    console.log(`   - Has originalFileData: ${!!doc.originalFileData}`);
                    console.log(`   - Has originalPdfData: ${!!doc.originalPdfData}`);
                    console.log(`   - File type: ${doc.fileType}`);
                    
                    // Check if document has images (PDFs, images, etc.)
                    if (doc.fileType && (doc.fileType.toLowerCase() === 'image' || doc.fileType.toLowerCase() === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(doc.fileType.toLowerCase()))) {
                        console.log(`🔍 Processing document: ${doc.filename || doc.name}`);
                        
                        // Extract images from document
                        const images = await extractImagesFromDocument(doc);
                        
                        if (images.length > 0) {
                            // Analyze each image
                            for (let i = 0; i < images.length; i++) {
                                const image = images[i];
                                const analysis = await analyzeImageWithVision(image.buffer);
                                
                                // Store in imageIndex collection
                                await db.collection('imageIndex').add({
                                    documentId: doc.id,
                                    documentName: doc.filename || doc.name,
                                    documentType: doc.fileType,
                                    collection: doc.collection,
                                    vehicleType: doc.vehicleType || 'General',
                                    manualType: doc.manualType || doc.category || 'GENERAL',
                                    pageNumber: i + 1,
                                    imageData: image.buffer.toString('base64'),
                                    analysis: analysis,
                                    indexedAt: admin.firestore.FieldValue.serverTimestamp()
                                });
                            }
                            
                            console.log(`✅ Indexed ${images.length} images from ${doc.filename || doc.name}`);
                            indexedCount += images.length;
                        } else {
                            console.log(`⚠️ No images extracted from ${doc.filename || doc.name}`);
                        }
                    } else {
                        console.log(`⚠️ Skipping document ${doc.filename || doc.name} - unsupported file type: ${doc.fileType}`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing document ${doc.filename || doc.name}:`, error);
                    errorCount++;
                }
            }

            return res.json({
                success: true,
                message: `Image indexing completed`,
                totalDocuments: allDocuments.length,
                imagesIndexed: indexedCount,
                errors: errorCount
            });

        } catch (error) {
            console.error('❌ Error in image indexing:', error);
            return res.status(500).json({ 
                error: 'Failed to index images',
                details: error.message 
            });
        }
    });
});

// Helper function to generate image description
function generateImageDescription(labels, texts, objects, webEntities) {
    const parts = [];
    
    if (labels.length > 0) {
        const topLabels = labels.slice(0, 5).map(l => l.description).join(', ');
        parts.push(`Labels: ${topLabels}`);
    }
    
    if (texts.length > 0) {
        const textContent = texts[0].description;
        parts.push(`Text: ${textContent.substring(0, 200)}${textContent.length > 200 ? '...' : ''}`);
    }
    
    if (objects.length > 0) {
        const objectNames = objects.map(o => o.name).join(', ');
        parts.push(`Objects: ${objectNames}`);
    }
    
    return parts.join(' | ');
}

// Helper function to find matching documents
async function findMatchingDocuments(imageAnalysis, vehicleModel) {
    try {
        const query = db.collection('imageIndex');
        let snapshot = await query.get();
        
        const matches = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const score = calculateMatchScore(imageAnalysis, data.analysis, vehicleModel, data.vehicleType);
            
            if (score > 0.3) { // Minimum match threshold
                matches.push({
                    id: doc.id,
                    documentId: data.documentId,
                    documentName: data.documentName,
                    documentType: data.documentType,
                    collection: data.collection,
                    pageNumber: data.pageNumber,
                    matchScore: score,
                    vehicleType: data.vehicleType,
                    manualType: data.manualType
                });
            }
        });
        
        // Sort by match score
        return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
        
    } catch (error) {
        console.error('❌ Error finding matching documents:', error);
        return [];
    }
}

// Helper function to calculate match score
function calculateMatchScore(uploadedAnalysis, indexedAnalysis, vehicleModel, indexedVehicleType) {
    let score = 0;
    
    // Vehicle type match
    if (vehicleModel && indexedVehicleType) {
        if (vehicleModel.toLowerCase().includes(indexedVehicleType.toLowerCase()) || 
            indexedVehicleType.toLowerCase().includes(vehicleModel.toLowerCase())) {
            score += 0.4;
        }
    }
    
    // Label similarity
    const uploadedLabels = uploadedAnalysis.labels.map(l => l.description.toLowerCase());
    const indexedLabels = indexedAnalysis.labels.map(l => l.description.toLowerCase());
    
    const commonLabels = uploadedLabels.filter(label => 
        indexedLabels.some(indexedLabel => 
            indexedLabel.includes(label) || label.includes(indexedLabel)
        )
    );
    
    score += (commonLabels.length / Math.max(uploadedLabels.length, indexedLabels.length)) * 0.3;
    
    // Text similarity
    if (uploadedAnalysis.texts.length > 0 && indexedAnalysis.texts.length > 0) {
        const uploadedText = uploadedAnalysis.texts[0].description.toLowerCase();
        const indexedText = indexedAnalysis.texts[0].description.toLowerCase();
        
        const commonWords = uploadedText.split(' ').filter(word => 
            indexedText.includes(word) && word.length > 3
        );
        
        score += (commonWords.length / Math.max(uploadedText.split(' ').length, indexedText.split(' ').length)) * 0.3;
    }
    
    return Math.min(score, 1.0);
}

// Helper function to generate step-by-step solution using Gemini
async function generateStepByStepSolution(imageAnalysis, matchingDocs, vehicleModel, problemDescription) {
    try {
        const prompt = `
Als Cadillac EV Experte, analysiere das hochgeladene Bild und erstelle eine detaillierte Schritt-für-Schritt Lösung.

BILDANALYSE:
${JSON.stringify(imageAnalysis, null, 2)}

GEFUNDENE DOKUMENTE:
${matchingDocs.map(doc => `- ${doc.documentName} (Seite ${doc.pageNumber}) - ${doc.manualType} - Übereinstimmung: ${Math.round(doc.matchScore * 100)}%`).join('\n')}

FAHRZEUGMODELL: ${vehicleModel || 'Nicht angegeben'}
PROBLEMBESCHREIBUNG: ${problemDescription || 'Nicht angegeben'}

Erstelle eine strukturierte Antwort im JSON Format:
{
  "problemIdentified": "Kurze Beschreibung des identifizierten Problems",
  "severity": "niedrig|mittel|hoch|kritisch",
  "safetyWarning": "Sicherheitshinweis falls erforderlich oder null",
  "immediateAction": "Sofortige Maßnahme",
  "stepByStepSolution": [
    {
      "step": 1,
      "title": "Schritt-Titel",
      "description": "Detaillierte Beschreibung",
      "tools": ["Benötigte Werkzeuge"],
      "time": "Geschätzte Zeit",
      "difficulty": "einfach|mittel|schwer"
    }
  ],
  "preventionTips": ["Tipp 1", "Tipp 2"],
  "relatedDocuments": ["Relevante Dokumente"],
  "estimatedCost": "Geschätzte Kosten oder 'Kostenlos'"
}
`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (content) {
            try {
                return JSON.parse(content);
            } catch (parseError) {
                console.error('❌ Error parsing Gemini response:', parseError);
                return createFallbackSolution(imageAnalysis);
            }
        } else {
            return createFallbackSolution(imageAnalysis);
        }

    } catch (error) {
        console.error('❌ Error generating solution with Gemini:', error);
        return createFallbackSolution(imageAnalysis);
    }
}

// Helper function to create fallback solution
function createFallbackSolution(imageAnalysis) {
    return {
        problemIdentified: "Bildanalyse durchgeführt - manuelle Überprüfung erforderlich",
        severity: "mittel",
        safetyWarning: "Bei Unsicherheit Fachwerkstatt kontaktieren",
        immediateAction: "Fahrzeughandbuch konsultieren",
        stepByStepSolution: [
            {
                step: 1,
                title: "Problem identifizieren",
                description: imageAnalysis.fullDescription,
                tools: ["Fahrzeughandbuch", "Multimeter (falls elektrisch)"],
                time: "5-10 Minuten",
                difficulty: "einfach"
            },
            {
                step: 2,
                title: "Fachwerkstatt kontaktieren",
                description: "Bei komplexen Problemen professionelle Hilfe in Anspruch nehmen",
                tools: ["Telefon", "Fahrzeughandbuch"],
                time: "15-30 Minuten",
                difficulty: "einfach"
            }
        ],
        preventionTips: [
            "Regelmäßige Wartung durchführen",
            "Warnleuchten sofort beachten"
        ],
        relatedDocuments: ["Fahrzeughandbuch", "Wartungsanleitung"],
        estimatedCost: "Je nach Problem"
    };
}

// Helper function to extract images from documents
async function extractImagesFromDocument(doc) {
    const images = [];
    
    try {
        console.log(`🔍 Extracting images from: ${doc.filename || doc.name} (${doc.fileType})`);
        
        if (doc.fileType && doc.fileType.toLowerCase() === 'pdf') {
            // For PDFs, extract images using a simple approach
            if (doc.originalFileData || doc.originalPdfData) {
                const pdfBuffer = Buffer.from(doc.originalFileData || doc.originalPdfData, 'base64');
                console.log(`📄 Processing PDF: ${doc.filename || doc.name} (${pdfBuffer.length} bytes)`);
                
                try {
                    // Enhanced PDF image extraction
                    const pdfContent = pdfBuffer.toString('binary');
                    
                    // Look for various image indicators in PDF
                    const imageIndicators = [
                        /\/Image\s+(\d+)\s+0\s+R/g,
                        /\/XObject.*\/Subtype\/Image/g,
                        /\/Filter.*\/DCTDecode/g,
                        /\/Width\s+(\d+).*\/Height\s+(\d+)/g,
                        /\/ColorSpace.*\/DeviceRGB/g
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
                        
                        // For now, treat the entire PDF as one image for analysis
                        // This allows the Vision API to analyze the PDF content
                        images.push({
                            buffer: pdfBuffer,
                            type: 'pdf',
                            filename: doc.filename || doc.name,
                            pageNumber: 1,
                            imageCount: imageCount
                        });
                    } else {
                    // Even if no images are detected, try to analyze the PDF anyway
                    // as it might contain diagrams, charts, or other visual content
                    console.log(`📄 No clear image indicators, but analyzing PDF anyway: ${doc.filename || doc.name}`);
                    
                    // For large PDFs, try to extract multiple "pages" as separate images
                    const pdfSize = pdfBuffer.length;
                    const chunkSize = Math.floor(pdfSize / 10); // Divide into 10 chunks
                    
                    for (let i = 0; i < 10; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, pdfSize);
                        const chunk = pdfBuffer.slice(start, end);
                        
                        images.push({
                            buffer: chunk,
                            type: 'pdf',
                            filename: doc.filename || doc.name,
                            pageNumber: i + 1,
                            imageCount: 0,
                            chunkIndex: i
                        });
                    }
                    
                    console.log(`📄 Split PDF into 10 chunks for analysis: ${doc.filename || doc.name}`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing PDF ${doc.filename || doc.name}:`, error);
                }
            } else {
                console.log(`⚠️ No originalFileData found for PDF: ${doc.filename || doc.name}`);
            }
        } else if (doc.fileType && doc.fileType.toLowerCase() === 'image') {
            // For image files, use the content directly
            if (doc.originalFileData) {
                console.log(`📸 Processing image file: ${doc.filename || doc.name}`);
                images.push({
                    buffer: Buffer.from(doc.originalFileData, 'base64'),
                    type: doc.fileType,
                    filename: doc.filename || doc.name
                });
            } else {
                console.log(`⚠️ No originalFileData found for image: ${doc.filename || doc.name}`);
            }
        } else if (doc.fileType && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(doc.fileType.toLowerCase())) {
            // Handle specific image file extensions
            if (doc.originalFileData) {
                console.log(`📸 Processing ${doc.fileType} file: ${doc.filename || doc.name}`);
                images.push({
                    buffer: Buffer.from(doc.originalFileData, 'base64'),
                    type: doc.fileType,
                    filename: doc.filename || doc.name
                });
            } else {
                console.log(`⚠️ No originalFileData found for ${doc.fileType}: ${doc.filename || doc.name}`);
            }
        } else {
            console.log(`⚠️ Unsupported file type for image extraction: ${doc.fileType}`);
        }
        
        console.log(`📊 Extracted ${images.length} images from ${doc.filename || doc.name}`);
    } catch (error) {
        console.error('❌ Error extracting images from document:', error);
    }
    
    return images;
}

// Helper function to analyze image with Vision API
async function analyzeImageWithVision(imageBuffer) {
    try {
        const [result] = await visionClient.annotateImage({
            image: { content: imageBuffer },
            features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'TEXT_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
        });

        return {
            labels: result.labelAnnotations || [],
            texts: result.textAnnotations || [],
            objects: result.localizedObjectAnnotations || []
        };
    } catch (error) {
        console.error('❌ Error analyzing image with Vision API:', error);
        return { labels: [], texts: [], objects: [] };
    }
}

// Large file upload endpoint for owner manuals
exports.uploadLargeFile = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('📤 Large file upload request received');
            
            const { filename, content, vehicleType, category, size } = req.body;
            
            if (!filename || !content) {
                return res.status(400).json({ error: 'Filename and content are required' });
            }
            
            // Convert base64 to buffer
            const fileBuffer = Buffer.from(content, 'base64');
            const sizeMB = Math.round(fileBuffer.length / 1024 / 1024);
            
            console.log(`📊 Processing large file: ${filename} (${sizeMB}MB)`);
            
            // Upload to Cloud Storage
            const storageResult = await uploadLargeFileToStorage(fileBuffer, filename, {
                vehicleType: vehicleType || 'General',
                category: category || 'Large Owner Manuals',
                size: fileBuffer.length
            }, db);
            
            // Store metadata in Firestore
            const docId = await storeLargeFileMetadata(filename, storageResult.storageUrl, {
                vehicleType: vehicleType || 'General',
                category: category || 'Large Owner Manuals',
                size: fileBuffer.length,
                previewData: content.slice(0, 1024 * 1024) // First 1MB for preview
            }, db);
            
            // Extract images from the large PDF
            console.log('🔍 Extracting images from large PDF...');
            const images = await extractImagesFromLargePDF(storageResult.storageUrl, filename, db);
            
            // Index the extracted images
            let indexedCount = 0;
            if (images.length > 0) {
                console.log(`🖼️ Found ${images.length} image chunks, indexing...`);
                
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    try {
                        const analysis = await analyzeImageWithVision(image.buffer);
                        
                        await db.collection('imageIndex').add({
                            documentId: docId,
                            documentName: filename,
                            documentType: 'pdf',
                            collection: 'largeFiles',
                            vehicleType: vehicleType || 'General',
                            manualType: category || 'Large Owner Manuals',
                            pageNumber: image.pageNumber,
                            chunkIndex: image.chunkIndex,
                            imageData: image.buffer.toString('base64'),
                            analysis: analysis,
                            isLargeFile: true,
                            storageUrl: storageResult.storageUrl,
                            indexedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                        
                        indexedCount++;
                    } catch (error) {
                        console.error(`❌ Error indexing image chunk ${i + 1}:`, error);
                    }
                }
            }
            
            console.log(`✅ Large file processed: ${indexedCount} images indexed`);
            
            return res.json({
                success: true,
                message: 'Large file uploaded and processed successfully',
                docId: docId,
                storageUrl: storageResult.storageUrl,
                imagesIndexed: indexedCount,
                totalChunks: images.length,
                sizeMB: sizeMB
            });
            
        } catch (error) {
            console.error('❌ Large file upload error:', error);
            return res.status(500).json({ 
                error: 'Failed to upload large file',
                details: error.message 
            });
        }
    });
});

// Store image analysis results
exports.storeImageAnalysis = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('📊 Storing image analysis result');
            
            const { documentName, vehicleType, category, pageNumber, imageIndex, analysis, imageData, originalFile } = req.body;
            
            if (!documentName || !analysis) {
                return res.status(400).json({ error: 'Document name and analysis are required' });
            }
            
            // Store in imageIndex collection
            await db.collection('imageIndex').add({
                documentName: documentName,
                vehicleType: vehicleType || 'General',
                category: category || 'General Manuals',
                pageNumber: pageNumber || 1,
                imageIndex: imageIndex || 1,
                analysis: analysis,
                imageData: imageData,
                originalFile: originalFile,
                isDirectScan: true,
                scannedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ Image analysis stored for ${documentName}`);
            
            return res.json({
                success: true,
                message: 'Image analysis stored successfully'
            });
            
        } catch (error) {
            console.error('❌ Error storing image analysis:', error);
            return res.status(500).json({ 
                error: 'Failed to store image analysis',
                details: error.message 
            });
        }
    });
});

// Export migration function
exports.migrateDocumentsToStorage = migrateDocumentsToStorage;

// Helper function for cleanup (shared between HTTP and scheduled)
async function performCleanup() {
    let updatedKB = 0;
    let updatedTD = 0;
    
    // Category mappings
    const categoryMappings = {
        'LYRIQ Owner Manuals': 'LYRIQ',
        'VISTIQ Owner Manuals': 'VISTIQ',
        'OPTIQ Owner Manuals': 'OPTIQ',
        'Troubleshooting': 'TROUBLESHOOTING',
        'General': 'GENERAL',
        'SERVICE_MANUAL': 'SERVICE MANUAL',
        'service_manual': 'SERVICE MANUAL',
        'Service_Manual': 'SERVICE MANUAL',
        // Clean up invalid categories
        'OFFICIAL-WEBSITE': 'GENERAL',
        'official-website': 'GENERAL',
        'TXT': 'GENERAL',
        'POWERTRAIN': 'GENERAL',
        'powertrain': 'GENERAL',
        'MANUAL': 'GENERAL',
        'manual': 'GENERAL'
    };
    
    // Tags to exclude
    const tagsToExclude = ['TXT', 'PDF', 'DOC', 'DOCX', 'XLSX', 'MD', 
                           'official-website', 'OFFICIAL-WEBSITE',
                           'powertrain', 'POWERTRAIN',
                           'manual', 'MANUAL'];
    
    // Tags to merge
    const tagsToMerge = {
        'TROUBLESHOOTING': ['Troubleshooting', 'TROUBLESHOOTING'],
        'CHARGING': ['charging', 'CHARGING', 'Charging'],
        'SERVICE MANUAL': ['SERVICE_MANUAL', 'service_manual', 'Service_Manual', 'SERVICE MANUAL']
    };
    
    // Clean tags array
    function cleanTags(tags) {
        if (!Array.isArray(tags)) return [];
        
        const cleaned = [];
        const seen = new Set();
        
        tags.forEach(tag => {
            // Skip excluded tags
            if (tagsToExclude.includes(tag) || tagsToExclude.includes(tag.toUpperCase())) {
                return;
            }
            
            // Merge duplicates
            let cleanedTag = tag;
            for (const [canonicalTag, variations] of Object.entries(tagsToMerge)) {
                if (variations.includes(tag) || variations.includes(tag.toUpperCase())) {
                    cleanedTag = canonicalTag;
                    break;
                }
            }
            
            // Convert to uppercase
            cleanedTag = cleanedTag.toUpperCase();
            
            // Skip file extensions
            const fileExtensions = ['PDF', 'TXT', 'DOC', 'DOCX', 'XLSX', 'MD', 'PNG', 'JPG', 'JPEG'];
            if (fileExtensions.includes(cleanedTag)) {
                return;
            }
            
            // Add if not duplicate
            if (!seen.has(cleanedTag) && cleanedTag.trim() !== '') {
                cleaned.push(cleanedTag);
                seen.add(cleanedTag);
            }
        });
        
        return cleaned;
    }
    
    // Update Knowledge Base
    const kbSnapshot = await db.collection('knowledgebase').get();
    for (const doc of kbSnapshot.docs) {
        const data = doc.data();
        const updates = {};
        
        // Clean category
        if (data.category) {
            let newCategory = categoryMappings[data.category] || data.category;
            
            // If category is in the excluded tags, convert to GENERAL
            const upperCategory = newCategory.toUpperCase();
            if (tagsToExclude.includes(upperCategory) || 
                tagsToExclude.includes(newCategory)) {
                newCategory = 'GENERAL';
            } else {
                newCategory = upperCategory;
            }
            
            if (newCategory !== data.category.toUpperCase()) {
                updates.category = newCategory;
            }
        }
        
        // Clean tags
        if (data.tags && Array.isArray(data.tags)) {
            const cleanedTags = cleanTags(data.tags);
            if (JSON.stringify(cleanedTags) !== JSON.stringify(data.tags)) {
                updates.tags = cleanedTags;
            }
        }
        
        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            updatedKB++;
        }
    }
    
    // Update Technical Database
    const tdSnapshot = await db.collection('technicalDatabase').get();
    for (const doc of tdSnapshot.docs) {
        const data = doc.data();
        const updates = {};
        
        // Clean category
        if (data.category) {
            let newCategory = categoryMappings[data.category] || data.category;
            
            // If category is in the excluded tags, convert to GENERAL
            const upperCategory = newCategory.toUpperCase();
            if (tagsToExclude.includes(upperCategory) || 
                tagsToExclude.includes(newCategory)) {
                newCategory = 'GENERAL';
            } else {
                newCategory = upperCategory;
            }
            
            if (newCategory !== data.category.toUpperCase()) {
                updates.category = newCategory;
            }
        }
        
        // Clean tags
        if (data.tags && Array.isArray(data.tags)) {
            const cleanedTags = cleanTags(data.tags);
            if (JSON.stringify(cleanedTags) !== JSON.stringify(data.tags)) {
                updates.tags = cleanedTags;
            }
        }
        
        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            updatedTD++;
        }
    }
    
    return { updatedKB, updatedTD };
}

// Scheduled function to run cleanup automatically
exports.autoCleanupTags = functions.pubsub.schedule('every 6 hours').onRun(async (context) => {
    console.log('🧹 Starting automatic tag cleanup...');
    try {
        const result = await performCleanup();
        console.log(`✅ Automatic cleanup completed: KB ${result.updatedKB}, TD ${result.updatedTD}`);
        return null;
    } catch (error) {
        console.error('❌ Automatic cleanup failed:', error);
        throw error;
    }
});

// Update Categories and Tags Function
exports.updateCategoriesAndTags = functions.runWith({
    memory: '512MB',
    timeoutSeconds: 60
}).https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { updatedKB, updatedTD } = await performCleanup();
            
            return res.json({
                success: true,
                updatedKB,
                updatedTD,
                message: `Updated ${updatedKB + updatedTD} documents`
            });
            
        } catch (error) {
            console.error('Error updating categories and tags:', error);
            return res.status(500).json({ error: 'Failed to update categories and tags' });
        }
    });
});

// Smart categorize documents in GENERAL category
exports.smartCategorize = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 300
}).https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            console.log('🧠 Starting smart categorization...');
            
            let categorizedKB = 0;
            let categorizedTD = 0;
            
            // Get all documents with GENERAL/General category
            const kbSnapshot = await db.collection('knowledgebase')
                .get();
            
            const tdSnapshot = await db.collection('technicalDatabase')
                .get();
            
            const allDocs = [
                ...kbSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, db: 'knowledgebase', ref: doc.ref })),
                ...tdSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, db: 'technicalDatabase', ref: doc.ref }))
            ].filter(doc => {
                const cat = (doc.category || '').toUpperCase();
                return cat === 'GENERAL' || cat === '';
            });
            
            console.log(`Found ${allDocs.length} documents with GENERAL category`);
            
            // Analyze each document and categorize
            for (const doc of allDocs) {
                const filename = doc.filename || doc.name || '';
                const fileType = doc.fileType || '';
                const tags = doc.tags || [];
                
                // Determine new category based on filename and tags
                let newCategory = null;
                
                // Check for car model indicators (case-insensitive)
                // Also check for common patterns
                const upperFilename = filename.toUpperCase();
                
                console.log(`Analyzing: ${filename}`);
                
                // PRIORITY: Check for FAQ first (very specific)
                if (upperFilename.includes('FAQ') || 
                    upperFilename.includes('COMMON-QUESTIONS') ||
                    upperFilename.includes('QUESTION')) {
                    newCategory = 'FAQ';
                    console.log(`  → Categorized as FAQ`);
                }
                // Then check for GUIDEs
                else if (upperFilename.includes('GUIDE') || 
                         upperFilename.includes('ACTIVATION') ||
                         upperFilename.includes('HOW-TO') ||
                         upperFilename.includes('QUICK START') ||
                         upperFilename.includes('QUICKSTART')) {
                    newCategory = 'GUIDE';
                    console.log(`  → Categorized as GUIDE`);
                }
                // Charging documents
                else if (upperFilename.includes('CHARGE') || 
                         upperFilename.includes('BATTERY') ||
                         tags.some(t => t.toUpperCase().includes('CHARGE'))) {
                    newCategory = 'CHARGING';
                    console.log(`  → Categorized as CHARGING`);
                }
                // Troubleshooting
                else if (upperFilename.includes('TROUBLESHOOT') || 
                         upperFilename.includes('DIAGNOSE') ||
                         tags.some(t => t.toUpperCase().includes('TROUBLESHOOT'))) {
                    newCategory = 'TROUBLESHOOTING';
                    console.log(`  → Categorized as TROUBLESHOOTING`);
                }
                // Specifications
                else if (upperFilename.includes('SPECIFICATION') || 
                         upperFilename.includes('SPECS') ||
                         upperFilename.includes('SPEC') ||
                         fileType === 'XLS' || fileType === 'XLSX') {
                    newCategory = 'SPECIFICATIONS';
                    console.log(`  → Categorized as SPECIFICATIONS`);
                }
                // Warranty
                else if (upperFilename.includes('WARRANTY') ||
                         upperFilename.includes('GARANTIE')) {
                    newCategory = 'WARRANTY';
                    console.log(`  → Categorized as WARRANTY`);
                }
                // Service Manuals
                else if (upperFilename.includes('SERVICE') || 
                         upperFilename.includes('REPAIR') ||
                         upperFilename.includes('MAINTENANCE')) {
                    newCategory = 'SERVICE MANUAL';
                    console.log(`  → Categorized as SERVICE MANUAL`);
                }
                // Resources
                else if (upperFilename.includes('WEBSITE') ||
                         upperFilename.includes('DATA') ||
                         upperFilename.includes('LINK') ||
                         upperFilename.includes('LIBRARY')) {
                    newCategory = 'RESOURCES';
                    console.log(`  → Categorized as RESOURCES`);
                }
                // Car models - check after specific categories
                else if (upperFilename.includes('LYRIQ') || 
                          tags.some(t => t.toUpperCase().includes('LYRIQ'))) {
                    newCategory = 'LYRIQ';
                    console.log(`  → Categorized as LYRIQ`);
                } else if (upperFilename.includes('VISTIQ') || 
                           tags.some(t => t.toUpperCase().includes('VISTIQ'))) {
                    newCategory = 'VISTIQ';
                    console.log(`  → Categorized as VISTIQ`);
                } else if (upperFilename.includes('OPTIQ') || 
                           tags.some(t => t.toUpperCase().includes('OPTIQ'))) {
                    newCategory = 'OPTIQ';
                    console.log(`  → Categorized as OPTIQ`);
                }
                
                // Update if we found a more specific category
                if (newCategory && newCategory !== 'GENERAL') {
                    try {
                        await doc.ref.update({ category: newCategory });
                        console.log(`✅ Moved "${filename}" from GENERAL to ${newCategory}`);
                        
                        if (doc.db === 'knowledgebase') {
                            categorizedKB++;
                        } else {
                            categorizedTD++;
                        }
                    } catch (error) {
                        console.error(`❌ Error updating ${doc.id}:`, error);
                    }
                } else {
                    console.log(`⚠️  No specific category found for: ${filename}`);
                }
            }
            
            return res.json({
                success: true,
                categorizedKB,
                categorizedTD,
                total: categorizedKB + categorizedTD,
                message: `Smart categorization complete: ${categorizedKB + categorizedTD} documents recategorized`
            });
            
        } catch (error) {
            console.error('Error in smart categorization:', error);
            return res.status(500).json({ error: 'Failed to categorize documents' });
        }
    });
});

