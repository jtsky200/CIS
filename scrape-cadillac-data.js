#!/usr/bin/env node

/**
 * Automated Cadillac Website Scraper
 * 
 * This script scrapes the official Cadillac Europe website for technical specifications
 * and automatically updates the knowledge base in Firestore.
 * 
 * Usage: node scrape-cadillac-data.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CADILLAC_BASE_URL = 'https://www.cadillaceurope.com/ch-de';
const MODELS = ['lyriq', 'vistiq', 'lyriq-v', 'optiq'];
const OUTPUT_DIR = '/home/ubuntu/cadillac-scraped-data';

// Ensure output directory exists
async function ensureOutputDir() {
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`✓ Output directory ready: ${OUTPUT_DIR}`);
    } catch (error) {
        console.error('Error creating output directory:', error);
        throw error;
    }
}

// Scrape a single model page
async function scrapeModelPage(model) {
    const url = `${CADILLAC_BASE_URL}/${model}`;
    const outputFile = path.join(OUTPUT_DIR, `${model}-scraped.json`);
    
    console.log(`\n📡 Scraping ${model.toUpperCase()}...`);
    console.log(`   URL: ${url}`);
    
    try {
        const command = `manus-mcp-cli tool call firecrawl_scrape --server firecrawl --input '${JSON.stringify({
            url: url,
            formats: ['markdown'],
            onlyMainContent: true,
            maxAge: 0  // Force fresh scrape
        })}'`;
        
        const { stdout, stderr } = await execAsync(command);
        
        // Save raw output
        await fs.writeFile(outputFile, stdout);
        
        // Parse the result - find the line that starts with "Tool execution result:"
        const lines = stdout.split('\n');
        const resultIndex = lines.findIndex(line => line.includes('Tool execution result:'));
        
        if (resultIndex !== -1) {
            // The JSON starts after "Tool execution result:" line
            const jsonLines = lines.slice(resultIndex + 1);
            const jsonText = jsonLines.join('\n').trim();
            
            try {
                const result = JSON.parse(jsonText);
                console.log(`   ✓ Successfully scraped ${model}`);
                return {
                    model: model,
                    url: url,
                    markdown: result.markdown,
                    metadata: result.metadata,
                    scrapedAt: new Date().toISOString()
                };
            } catch (parseError) {
                console.log(`   ⚠ Error parsing JSON for ${model}:`, parseError.message);
                // Try to find JSON object in the output
                const jsonMatch = stdout.match(/\{[\s\S]*"markdown"[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    console.log(`   ✓ Successfully scraped ${model} (fallback parsing)`);
                    return {
                        model: model,
                        url: url,
                        markdown: result.markdown,
                        metadata: result.metadata,
                        scrapedAt: new Date().toISOString()
                    };
                }
                return null;
            }
        } else {
            console.log(`   ⚠ No JSON data found for ${model}`);
            return null;
        }
    } catch (error) {
        console.error(`   ✗ Error scraping ${model}:`, error.message);
        return null;
    }
}

// Extract technical specifications from markdown
function extractTechnicalSpecs(markdown, model) {
    const specs = {
        model: model.toUpperCase(),
        price: null,
        weight: null,
        range: null,
        battery: null,
        charging: null,
        power: null,
        consumption: null
    };
    
    // Extract price (e.g., "Ab CHF 90'100")
    const priceMatch = markdown.match(/Ab CHF ([\d']+)/i);
    if (priceMatch) {
        specs.price = `CHF ${priceMatch[1]}`;
    }
    
    // Extract weight (e.g., "2.774 kg")
    const weightMatch = markdown.match(/(\d+[.,]\d+)\s*kg/i);
    if (weightMatch) {
        specs.weight = `${weightMatch[1]} kg`;
    }
    
    // Extract range (e.g., "530 km")
    const rangeMatch = markdown.match(/Reichweite[^\d]*(\d+)\s*km/i);
    if (rangeMatch) {
        specs.range = `${rangeMatch[1]} km`;
    }
    
    // Extract consumption (e.g., "22.5 kWh / 100 km")
    const consumptionMatch = markdown.match(/(\d+[.,]?\d*)\s*kWh\s*\/\s*100\s*km/i);
    if (consumptionMatch) {
        specs.consumption = `${consumptionMatch[1]} kWh/100 km`;
    }
    
    return specs;
}

// Create a markdown document from scraped data
async function createKnowledgeBaseDocument(scrapedData) {
    const specs = extractTechnicalSpecs(scrapedData.markdown, scrapedData.model);
    
    const markdown = `# Cadillac ${specs.model} - Technische Daten und Spezifikationen

**Letzte Aktualisierung:** ${new Date().toLocaleDateString('de-CH')}

## Preisinformationen

${specs.price ? `- **Preis ab:** ${specs.price}` : '- Preis: Noch nicht verfügbar'}

## Technische Spezifikationen

${specs.weight ? `- **Leergewicht:** ${specs.weight}` : ''}
${specs.range ? `- **Reichweite (WLTP):** ${specs.range}` : ''}
${specs.consumption ? `- **Stromverbrauch:** ${specs.consumption}` : ''}
${specs.battery ? `- **Batterie:** ${specs.battery}` : ''}
${specs.charging ? `- **Ladezeit:** ${specs.charging}` : ''}
${specs.power ? `- **Leistung:** ${specs.power}` : ''}

## Zusätzliche Informationen

Für detaillierte und aktuelle Informationen besuchen Sie bitte:
${scrapedData.url}

---

*Diese Informationen wurden automatisch von der offiziellen Cadillac-Website extrahiert.*
*Quelle: ${scrapedData.url}*
*Scraping-Datum: ${scrapedData.scrapedAt}*
`;
    
    const filename = path.join(OUTPUT_DIR, `cadillac-${scrapedData.model}-specs-${Date.now()}.md`);
    await fs.writeFile(filename, markdown);
    
    console.log(`   ✓ Created knowledge base document: ${filename}`);
    
    return {
        filename: filename,
        specs: specs,
        markdown: markdown
    };
}

// Upload document to Firestore via the upload endpoint
async function uploadToFirestore(filename) {
    console.log(`\n📤 Uploading to Firestore: ${path.basename(filename)}`);
    
    try {
        const command = `curl -X POST \
            -F "files=@${filename}" \
            https://us-central1-cis-de.cloudfunctions.net/upload`;
        
        const { stdout } = await execAsync(command);
        const result = JSON.parse(stdout);
        
        if (result.success) {
            console.log(`   ✓ Successfully uploaded to Firestore`);
            console.log(`   Documents uploaded: ${result.documentsUploaded}`);
            return true;
        } else {
            console.log(`   ⚠ Upload completed but no documents were added`);
            return false;
        }
    } catch (error) {
        console.error(`   ✗ Error uploading to Firestore:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Cadillac Website Scraper Starting...\n');
    console.log('=' .repeat(60));
    
    try {
        // Ensure output directory exists
        await ensureOutputDir();
        
        // Scrape all model pages
        console.log('\n📡 PHASE 1: Scraping Cadillac website...');
        const scrapedData = [];
        
        for (const model of MODELS) {
            const data = await scrapeModelPage(model);
            if (data) {
                scrapedData.push(data);
            }
            // Wait a bit between requests to be polite
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`\n✓ Scraped ${scrapedData.length} out of ${MODELS.length} models`);
        
        // Create knowledge base documents
        console.log('\n📝 PHASE 2: Creating knowledge base documents...');
        const documents = [];
        
        for (const data of scrapedData) {
            const doc = await createKnowledgeBaseDocument(data);
            documents.push(doc);
        }
        
        console.log(`\n✓ Created ${documents.length} knowledge base documents`);
        
        // Upload to Firestore
        console.log('\n📤 PHASE 3: Uploading to Firestore...');
        let uploadedCount = 0;
        
        for (const doc of documents) {
            const success = await uploadToFirestore(doc.filename);
            if (success) uploadedCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('✅ SCRAPING COMPLETE\n');
        console.log(`📊 Summary:`);
        console.log(`   - Models scraped: ${scrapedData.length}/${MODELS.length}`);
        console.log(`   - Documents created: ${documents.length}`);
        console.log(`   - Documents uploaded: ${uploadedCount}`);
        console.log(`   - Output directory: ${OUTPUT_DIR}`);
        console.log('\n💡 Next steps:');
        console.log('   - Check the Wissensdatenbank in the web app');
        console.log('   - Test the chatbot with updated information');
        console.log('   - Schedule this script to run regularly (e.g., daily)');
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { scrapeModelPage, extractTechnicalSpecs, createKnowledgeBaseDocument };

