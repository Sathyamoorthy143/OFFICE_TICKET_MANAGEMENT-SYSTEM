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
        if (key && value) env[key.trim()] = value.trim();
    });
} catch (e) {
    console.error('Failed to load .env file');
}

const WEBHOOK_URL = env.N8N_WEBHOOK_URL;

/**
 * Simulates fetching GitHub trending repositories
 * In a real scenario, this would use the GitHub API or scrape the trending page.
 * For this implementation, we'll use the GitHub Search API to find recent popular repos
 * matching our "template" or "starter" keywords.
 */
async function fetchGitHubTrending() {
    console.log('🔍 Searching GitHub for trending templates...');

    const queries = [
        'topic:template stars:>100 pushed:>2024-01-01',
        'topic:starter stars:>100 pushed:>2024-01-01',
        'topic:boilerplate stars:>100 pushed:>2024-01-01'
    ];

    // Pick a random query to vary results
    const query = queries[Math.floor(Math.random() * queries.length)];

    try {
        const results = await searchGitHub(query);
        console.log(`Found ${results.length} repositories.`);

        for (const repo of results) {
            await processRepo(repo);
        }
    } catch (error) {
        console.error('Error fetching GitHub data:', error.message);
    }
}

function searchGitHub(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
            headers: {
                'User-Agent': 'Template-Monitor-Bot',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.items || []);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function processRepo(repo) {
    const payload = {
        name: repo.name,
        description: repo.description || 'No description provided',
        problemSolved: `Addresses needs related to ${repo.topics.join(', ') || 'software development'}`,
        useCase: `Useful for developers building ${repo.language || 'modern'} applications`,
        features: [`${repo.stargazers_count} Stars`, `Language: ${repo.language}`, ...repo.topics.slice(0, 3)],
        category: determineCategory(repo),
        source: repo.html_url
    };

    console.log(`\n📤 Sending: ${payload.name}`);
    await sendToWebhook(payload);
}

function determineCategory(repo) {
    const text = (repo.description + ' ' + repo.topics.join(' ')).toLowerCase();
    if (text.includes('ui') || text.includes('design') || text.includes('css')) return 'UI/UX Design';
    if (text.includes('api') || text.includes('microservice')) return 'Software Architecture';
    if (text.includes('security') || text.includes('auth')) return 'Security Pattern';
    return 'Development Framework';
}

function sendToWebhook(payload) {
    return new Promise((resolve, reject) => {
        if (!WEBHOOK_URL) {
            console.log('(Dry Run) Webhook URL not set');
            return resolve();
        }

        const url = new URL(WEBHOOK_URL);
        const req = https.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(payload))
            }
        }, (res) => {
            res.on('data', () => { }); // Consume stream
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ Sent successfully');
                    resolve();
                } else {
                    console.log(`❌ Failed: ${res.statusCode}`);
                    resolve(); // Resolve anyway to continue processing
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e.message);
            resolve();
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

// Run if executed directly
fetchGitHubTrending();
