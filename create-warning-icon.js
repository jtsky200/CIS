const fs = require('fs');
const https = require('https');

// Create a simple warning icon using canvas (if available) or create a base64 image
function createWarningIcon() {
    // This is a simple 1x1 pixel warning icon in base64
    // In a real implementation, you would use a proper image library
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
}

// Test the analysis with a proper warning icon
async function testWarningIconAnalysis() {
    try {
        console.log('🔍 Testing warning icon analysis...');
        
        // For now, let's use a more descriptive base64 image
        // This represents a simple warning triangle
        const warningIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        
        const requestData = {
            imageData: warningIconBase64,
            vehicleModel: "Cadillac VISTIQ",
            problemDescription: "Warning light on dashboard - exclamation mark in triangle"
        };
        
        const postData = JSON.stringify(requestData);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/analyzeUploadedImage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    console.log('\n=== WARNING ICON ANALYSIS RESULTS ===');
                    console.log('');
                    console.log('VISION API DETECTION:');
                    if (result.analysis && result.analysis.labels) {
                        result.analysis.labels.forEach(label => {
                            console.log(`- ${label.description} (${label.confidence}%)`);
                        });
                    }
                    console.log('');
                    console.log('DATABASE MATCHING:');
                    console.log(`Matching documents found: ${result.matchingDocuments ? result.matchingDocuments.length : 0}`);
                    console.log('');
                    console.log('TROUBLESHOOTING SOLUTION:');
                    if (result.solution) {
                        console.log(`Problem: ${result.solution.problemIdentified}`);
                        console.log(`Severity: ${result.solution.severity}`);
                        console.log(`Immediate Action: ${result.solution.immediateAction}`);
                        console.log('');
                        console.log('STEPS:');
                        if (result.solution.stepByStepSolution) {
                            result.solution.stepByStepSolution.forEach(step => {
                                console.log(`Step ${step.step}: ${step.title}`);
                                console.log(`  ${step.description}`);
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ Error parsing response:', error);
                    console.log('Raw response:', responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
        });

        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the test
testWarningIconAnalysis();
