import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(process.cwd(), 'automation', '.env.automation');
let env = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.error('Error reading .env.automation:', error.message);
}

const WEBHOOK_URL = env.N8N_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.error('Error: N8N_WEBHOOK_URL not found in .env.automation');
    process.exit(1);
}

const testPayload = {
    name: "Test Template: Microservices Auth Pattern",
    description: "A comprehensive authentication pattern for microservices using JWT and OAuth2. Solves the distributed security problem.",
    problemSolved: "Managing secure authentication across multiple distributed services without code duplication.",
    useCase: "Modern cloud-native applications requiring scalable security.",
    features: ["JWT Support", "OAuth2 Integration", "Role-Based Access Control", "Stateless Validation"],
    category: "Security Pattern",
    source: "https://github.com/example/auth-pattern-test"
};

console.log(`Sending test payload to: ${WEBHOOK_URL}`);
console.log('Payload:', JSON.stringify(testPayload, null, 2));

const url = new URL(WEBHOOK_URL);
const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testPayload))
    }
};

const req = https.request(options, (res) => {
    console.log(`\nStatus Code: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });

    res.on('end', () => {
        console.log('\n\nRequest completed.');
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Success! Webhook received the data.');
        } else {
            console.log('❌ Failed. Check n8n workflow status.');
        }
    });
});

req.on('error', (error) => {
    console.error('\nError sending request:', error);
});

req.write(JSON.stringify(testPayload));
req.end();
