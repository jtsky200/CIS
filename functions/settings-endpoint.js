const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Settings endpoint for managing app customization
exports.settings = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const db = admin.firestore();
        
        try {
            if (req.method === 'GET') {
                // Get current settings
                const settingsDoc = await db.collection('app_settings').doc('branding').get();
                
                if (!settingsDoc.exists) {
                    // Return default settings
                    const defaultSettings = {
                        logo: '',  // Empty means use default
                        brandText: 'Cadillac EV',
                        welcomeTitle: 'Cadillac EV Assistant',
                        welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                        quickActions: [
                            'Was kostet der Cadillac LYRIQ?',
                            'Wie hoch ist die Reichweite?',
                            'Lieferzeiten & Bestellung',
                            'Garantie & Service'
                        ]
                    };
                    res.json(defaultSettings);
                } else {
                    res.json(settingsDoc.data());
                }
            }
            else if (req.method === 'POST') {
                // Update settings
                const { logo, brandText, welcomeTitle, welcomeSubtitle, quickActions } = req.body;
                
                const settings = {
                    logo: logo || '',
                    brandText: brandText || 'Cadillac EV',
                    welcomeTitle: welcomeTitle || 'Cadillac EV Assistant',
                    welcomeSubtitle: welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                    quickActions: quickActions || [],
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };
                
                await db.collection('app_settings').doc('branding').set(settings, { merge: true });
                
                res.json({ success: true, settings });
            }
            else {
                res.status(405).json({ error: 'Method not allowed' });
            }
            
        } catch (error) {
            console.error('Settings error:', error);
            res.status(500).json({ error: 'Failed to process settings', message: error.message });
        }
    });
});

