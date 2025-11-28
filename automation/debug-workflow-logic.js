// Debug script to simulate n8n node logic
const inputData = {
    "body": {
        "name": "Test Template: Microservices Auth Pattern",
        "description": "A comprehensive authentication pattern for microservices using JWT and OAuth2. Solves the distributed security problem.",
        "problemSolved": "Managing secure authentication across multiple distributed services without code duplication.",
        "useCase": "Modern cloud-native applications requiring scalable security.",
        "features": [
            "JWT Support",
            "OAuth2 Integration",
            "Role-Based Access Control",
            "Stateless Validation"
        ],
        "category": "Security Pattern",
        "source": "https://github.com/example/auth-pattern-test"
    }
};

// --- COPY OF N8N NODE LOGIC START ---
// Template Evaluation Logic
// const inputData = $input.item.json; // Commented out for local run
// Handle webhook nesting (data might be in 'body')
const template = inputData.body || inputData;

// Configuration (embedded for portability)
const config = {
    relevanceKeywords: {
        modern: ['AI', 'machine learning', 'microservices', 'cloud-native', 'serverless', 'real-time', 'automation', 'API-first', 'mobile-first', 'responsive', 'scalable', 'distributed', 'containerization', 'kubernetes', 'DevOps', 'CI/CD', 'agile', 'remote work', 'collaboration', 'data-driven', 'analytics', 'cybersecurity', 'zero-trust', 'blockchain', 'IoT', 'edge computing', 'PWA', 'jamstack', 'headless CMS', 'low-code', 'no-code'],
        problemFocused: ['solves', 'addresses', 'tackles', 'eliminates', 'reduces', 'optimizes', 'streamlines', 'automates', 'improves', 'enhances', 'simplifies', 'accelerates', 'prevents', 'mitigates']
    },
    industries: ['Healthcare', 'Finance', 'E-commerce', 'SaaS', 'Education', 'Manufacturing', 'Logistics', 'Media & Entertainment', 'Government', 'Technology', 'Retail', 'Real Estate', 'Other'],
    weights: {
        modernTechAlignment: 0.3,
        problemClarity: 0.25,
        broadApplicability: 0.25,
        industryRelevance: 0.2
    },
    relevanceThreshold: 65
};

function calculateModernTechAlignment(text) {
    let matchCount = 0;
    config.relevanceKeywords.modern.forEach(k => {
        if (text.toLowerCase().includes(k.toLowerCase())) matchCount++;
    });
    return Math.min(100, (matchCount / 3) * 100);
}

function calculateProblemClarity(problem, desc) {
    if (!problem || problem.length < 20) return 30;
    const text = (problem + ' ' + desc).toLowerCase();
    let matchCount = 0;
    config.relevanceKeywords.problemFocused.forEach(k => {
        if (text.includes(k)) matchCount++;
    });
    return 50 + Math.min(50, matchCount * 10);
}

function calculateBroadApplicability(text, features) {
    const indicators = ['any', 'all', 'various', 'multiple', 'flexible', 'adaptable', 'reusable', 'generic', 'universal', 'scalable'];
    let count = 0;
    indicators.forEach(i => {
        if (text.toLowerCase().includes(i)) count++;
    });
    let score = 40 + Math.min(40, count * 8);
    if (features && features.length >= 3) score += 20;
    return Math.min(100, score);
}

function calculateIndustryRelevance(text) {
    let matchCount = 0;
    config.industries.forEach(i => {
        if (text.toLowerCase().includes(i.toLowerCase())) matchCount++;
    });
    if (matchCount === 0) return 70; // Universal
    if (matchCount >= 3) return 95;
    if (matchCount >= 2) return 85;
    return 60;
}

function identifyIndustries(text) {
    const matched = [];
    config.industries.forEach(i => {
        if (text.toLowerCase().includes(i.toLowerCase())) matched.push(i);
    });
    return matched.length ? matched : ['Technology', 'Other'];
}

const description = template.description || '';
const problemSolved = template.problemSolved || '';
const useCase = template.useCase || '';
const features = template.features || [];
const fullText = `${description} ${problemSolved} ${useCase} ${features.join(' ')}`;

const modernScore = calculateModernTechAlignment(fullText);
const problemScore = calculateProblemClarity(problemSolved, description);
const applicabilityScore = calculateBroadApplicability(fullText, features);
const industryScore = calculateIndustryRelevance(fullText);

const totalScore = Math.round(
    modernScore * config.weights.modernTechAlignment +
    problemScore * config.weights.problemClarity +
    applicabilityScore * config.weights.broadApplicability +
    industryScore * config.weights.industryRelevance
);

const industries = identifyIndustries(fullText);

const result = {
    json: {
        ...template,
        evaluation: {
            score: totalScore,
            passes: totalScore >= config.relevanceThreshold,
            breakdown: { modernScore, problemScore, applicabilityScore, industryScore },
            industries
        }
    }
};
// --- COPY OF N8N NODE LOGIC END ---

console.log('Evaluation Result:', JSON.stringify(result.json.evaluation, null, 2));
