const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function createAssistant() {
    try {
        console.log('Creating new Assistant...');
        
        const assistant = await openai.beta.assistants.create({
            name: 'Cadillac EV Assistant',
            instructions: 'Du bist ein hilfreicher Assistent für Cadillac Elektrofahrzeuge. Beantworte Fragen über Cadillac Modelle, Preise, Technik und Service auf Deutsch. Verwende die bereitgestellten Wissensdatenbank-Dokumente, um präzise und aktuelle Informationen zu liefern.',
            model: 'gpt-4o-mini',
            tools: [
                {
                    type: 'file_search'
                }
            ]
        });
        
        console.log('✅ Assistant created successfully!');
        console.log('Assistant ID:', assistant.id);
        console.log('Name:', assistant.name);
        console.log('Model:', assistant.model);
        
        return assistant.id;
        
    } catch (error) {
        console.error('❌ Error creating assistant:', error);
        throw error;
    }
}

// Run the function
createAssistant()
    .then(assistantId => {
        console.log('\n🎉 Success! Use this Assistant ID in your .env file:');
        console.log(`ASSISTANT_ID=${assistantId}`);
    })
    .catch(error => {
        console.error('Failed to create assistant:', error);
        process.exit(1);
    });
