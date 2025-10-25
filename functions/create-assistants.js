const OpenAI = require('openai');

// Initialize OpenAI with admin key
const openai = new OpenAI({
    apiKey: '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'
});

console.log('OpenAI initialized:', !!openai);
console.log('Vector stores available:', !!openai.beta?.vectorStores);

async function createAssistants() {
    try {
        console.log('🚀 Creating new Assistants and Vector Stores...');

        // Check API availability
        console.log('🔍 Checking API availability...');
        console.log('openai.beta:', !!openai.beta);
        console.log('openai.beta.vectorStores:', !!openai.beta?.vectorStores);
        console.log('openai.beta.assistants:', !!openai.beta?.assistants);

        // 1. Create Vector Store for Knowledge Base
        console.log('📚 Creating Vector Store for Knowledge Base...');
        const knowledgeVectorStore = await openai.beta.vectorStores.create({
            name: 'Cadillac Knowledge Base 2025',
            description: 'Vector store for Cadillac EV knowledge base documents'
        });
        console.log('✅ Knowledge Vector Store created:', knowledgeVectorStore.id);

        // 2. Create Vector Store for Technical Database
        console.log('🔧 Creating Vector Store for Technical Database...');
        const technicalVectorStore = await openai.beta.vectorStores.create({
            name: 'Cadillac Technical Database 2025',
            description: 'Vector store for Cadillac EV technical documentation and troubleshooting'
        });
        console.log('✅ Technical Vector Store created:', technicalVectorStore.id);

        // 3. Create Knowledge Base Assistant
        console.log('🤖 Creating Knowledge Base Assistant...');
        const knowledgeAssistant = await openai.beta.assistants.create({
            name: 'Cadillac Knowledge Assistant',
            description: 'Specialized assistant for Cadillac EV knowledge base queries',
            instructions: `You are a specialized assistant for Cadillac EV knowledge base. 
            You have access to the latest Cadillac EV information, pricing, specifications, and general knowledge.
            Always provide accurate, up-to-date information based on the knowledge base documents.
            If you don't know something, say so clearly.
            Respond in German unless asked otherwise.`,
            model: 'gpt-4o-mini',
            tools: [{'type': 'file_search'}],
            tool_resources: {
                file_search: {
                    vector_store_ids: [knowledgeVectorStore.id]
                }
            }
        });
        console.log('✅ Knowledge Assistant created:', knowledgeAssistant.id);

        // 4. Create Technical Database Assistant
        console.log('🔧 Creating Technical Database Assistant...');
        const technicalAssistant = await openai.beta.assistants.create({
            name: 'Cadillac Technical Assistant',
            description: 'Specialized assistant for Cadillac EV technical support and troubleshooting',
            instructions: `You are a specialized technical support assistant for Cadillac EV vehicles.
            You have access to technical documentation, troubleshooting guides, and repair procedures.
            Help users diagnose and solve technical issues with their Cadillac EV.
            Provide step-by-step solutions and safety warnings when appropriate.
            Respond in German unless asked otherwise.`,
            model: 'gpt-4o-mini',
            tools: [{'type': 'file_search'}],
            tool_resources: {
                file_search: {
                    vector_store_ids: [technicalVectorStore.id]
                }
            }
        });
        console.log('✅ Technical Assistant created:', technicalAssistant.id);

        // 5. Create General Chat Assistant (updated)
        console.log('💬 Creating General Chat Assistant...');
        const chatAssistant = await openai.beta.assistants.create({
            name: 'Cadillac General Chat Assistant',
            description: 'General purpose assistant for Cadillac EV inquiries',
            instructions: `You are a helpful assistant for Cadillac EV customers.
            You can help with general questions about Cadillac EV vehicles, pricing, features, and services.
            You have access to both knowledge base and technical documentation.
            Always be helpful, accurate, and professional.
            Respond in German unless asked otherwise.`,
            model: 'gpt-4o-mini',
            tools: [{'type': 'file_search'}],
            tool_resources: {
                file_search: {
                    vector_store_ids: [knowledgeVectorStore.id, technicalVectorStore.id]
                }
            }
        });
        console.log('✅ Chat Assistant created:', chatAssistant.id);

        // Output configuration
        console.log('\n🎉 All Assistants and Vector Stores created successfully!');
        console.log('\n📋 Configuration for functions/index.js:');
        console.log('const KNOWLEDGE_ASSISTANT_ID = "' + knowledgeAssistant.id + '";');
        console.log('const TECHNICAL_ASSISTANT_ID = "' + technicalAssistant.id + '";');
        console.log('const CHAT_ASSISTANT_ID = "' + chatAssistant.id + '";');
        console.log('const KNOWLEDGE_VECTOR_STORE_ID = "' + knowledgeVectorStore.id + '";');
        console.log('const TECHNICAL_VECTOR_STORE_ID = "' + technicalVectorStore.id + '";');

        return {
            knowledgeAssistant: knowledgeAssistant.id,
            technicalAssistant: technicalAssistant.id,
            chatAssistant: chatAssistant.id,
            knowledgeVectorStore: knowledgeVectorStore.id,
            technicalVectorStore: technicalVectorStore.id
        };

    } catch (error) {
        console.error('❌ Error creating assistants:', error);
        throw error;
    }
}

// Run the function
createAssistants()
    .then(result => {
        console.log('\n✅ Setup completed successfully!');
        console.log('Result:', result);
    })
    .catch(error => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
