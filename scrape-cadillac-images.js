const puppeteer = require('puppeteer');
const fs = require('fs');

const modelPages = {
    'LYRIQ': 'https://www.cadillaceurope.com/ch-de/lyriq',
    'LYRIQ-V': 'https://www.cadillaceurope.com/ch-de/lyriq-v',
    'VISTIQ': 'https://www.cadillaceurope.com/ch-de/vistiq',
    'OPTIQ': 'https://www.cadillaceurope.com/ch-de/optiq'
};

async function scrapeModelImages() {
    console.log('🚗 Starting Cadillac image scraping...\n');
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const allImages = {};
    
    for (const [model, url] of Object.entries(modelPages)) {
        try {
            console.log(`📸 Scraping ${model} from ${url}...`);
            const page = await browser.newPage();
            
            // Set viewport for better image loading
            await page.setViewport({ width: 1920, height: 1080 });
            
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // Wait a bit for lazy-loaded images
            await page.waitForTimeout(3000);
            
            // Scroll to load more images
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight / 3);
            });
            await page.waitForTimeout(1000);
            
            await page.evaluate(() => {
                window.scrollTo(0, (document.body.scrollHeight / 3) * 2);
            });
            await page.waitForTimeout(1000);
            
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await page.waitForTimeout(2000);
            
            // Extract all images
            const images = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs
                    .map(img => ({
                        src: img.src || img.dataset.src || img.getAttribute('data-src'),
                        alt: img.alt || '',
                        title: img.title || '',
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height
                    }))
                    .filter(img => img.src);
            });
            
            // Filter for relevant Cadillac images
            const relevantImages = images.filter(img => {
                const url = img.src.toLowerCase();
                return (
                    url.includes('cadillac') &&
                    (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) &&
                    !url.includes('logo') &&
                    !url.includes('icon') &&
                    !url.includes('favicon') &&
                    !url.includes('social') &&
                    !url.includes('facebook') &&
                    !url.includes('instagram') &&
                    !url.includes('youtube') &&
                    !url.includes('tiktok') &&
                    img.width > 200 // Only images larger than 200px
                );
            });
            
            // Categorize images
            const categorized = {
                exterior: [],
                interior: [],
                technology: [],
                performance: [],
                charging: [],
                other: []
            };
            
            relevantImages.forEach(img => {
                const url = img.src.toLowerCase();
                const alt = img.alt.toLowerCase();
                
                if (url.includes('exterior') || alt.includes('exterior') || alt.includes('außen')) {
                    categorized.exterior.push(img.src);
                } else if (url.includes('interior') || alt.includes('interior') || alt.includes('innen')) {
                    categorized.interior.push(img.src);
                } else if (url.includes('technology') || url.includes('display') || alt.includes('display')) {
                    categorized.technology.push(img.src);
                } else if (url.includes('performance') || url.includes('brembo') || alt.includes('performance')) {
                    categorized.performance.push(img.src);
                } else if (url.includes('charging') || url.includes('charge') || alt.includes('laden')) {
                    categorized.charging.push(img.src);
                } else {
                    categorized.other.push(img.src);
                }
            });
            
            // Remove duplicates
            for (const category in categorized) {
                categorized[category] = [...new Set(categorized[category])];
            }
            
            allImages[model] = categorized;
            
            console.log(`✅ Found ${relevantImages.length} images for ${model}`);
            console.log(`   - Exterior: ${categorized.exterior.length}`);
            console.log(`   - Interior: ${categorized.interior.length}`);
            console.log(`   - Technology: ${categorized.technology.length}`);
            console.log(`   - Performance: ${categorized.performance.length}`);
            console.log(`   - Charging: ${categorized.charging.length}`);
            console.log(`   - Other: ${categorized.other.length}\n`);
            
            await page.close();
            
        } catch (error) {
            console.error(`❌ Error scraping ${model}:`, error.message);
        }
    }
    
    await browser.close();
    
    // Save to file
    fs.writeFileSync(
        'cadillac-images-database.json',
        JSON.stringify(allImages, null, 2)
    );
    
    console.log('✅ Image scraping complete!');
    console.log('📁 Saved to: cadillac-images-database.json\n');
    
    // Print summary
    let totalImages = 0;
    for (const model in allImages) {
        const count = Object.values(allImages[model]).reduce((sum, arr) => sum + arr.length, 0);
        totalImages += count;
        console.log(`${model}: ${count} images`);
    }
    console.log(`\n🎉 Total images scraped: ${totalImages}`);
}

// Run the scraper
scrapeModelImages().catch(console.error);

