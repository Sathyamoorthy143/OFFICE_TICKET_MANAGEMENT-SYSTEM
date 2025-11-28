/**
 * Template Evaluator - Scores templates based on relevance to modern challenges
 * and broad applicability across industries
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.json');

/**
 * Main evaluation function
 * @param {Object} template - Template data to evaluate
 * @returns {Object} Evaluation results with score and metadata
 */
export function evaluateTemplate(template) {
    const {
        name,
        description,
        features = [],
        category,
        problemSolved,
        useCase,
        source
    } = template;

    // Calculate component scores
    const modernScore = calculateModernTechAlignment(description, features, useCase);
    const problemScore = calculateProblemClarity(problemSolved, description);
    const applicabilityScore = calculateBroadApplicability(description, features, category);
    const industryScore = calculateIndustryRelevance(description, useCase);

    // Weighted total score
    const weights = config.evaluationCriteria.weights;
    const totalScore = Math.round(
        modernScore * weights.modernTechAlignment +
        problemScore * weights.problemClarity +
        applicabilityScore * weights.broadApplicability +
        industryScore * weights.industryRelevance
    );

    // Identify applicable industries
    const industries = identifyIndustries(description, useCase);

    // Categorize if not already categorized
    const finalCategory = category || categorizeTemplate(description, features);

    // Extract key features if not provided
    const keyFeatures = features.length > 0 ? features : extractKeyFeatures(description);

    return {
        score: totalScore,
        passesThreshold: totalScore >= config.evaluationCriteria.relevanceThreshold,
        breakdown: {
            modernTechAlignment: modernScore,
            problemClarity: problemScore,
            broadApplicability: applicabilityScore,
            industryRelevance: industryScore
        },
        metadata: {
            category: finalCategory,
            industries,
            keyFeatures,
            evaluatedAt: new Date().toISOString()
        }
    };
}

/**
 * Calculate how well the template aligns with modern technology trends
 */
function calculateModernTechAlignment(description, features, useCase) {
    const text = `${description} ${features.join(' ')} ${useCase}`.toLowerCase();
    const modernKeywords = config.relevanceKeywords.modern;

    let matchCount = 0;
    modernKeywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    });

    // Score based on percentage of modern keywords found
    const score = Math.min(100, (matchCount / Math.min(modernKeywords.length * 0.1, 10)) * 100);
    return Math.round(score);
}

/**
 * Calculate how clearly the template defines the problem it solves
 */
function calculateProblemClarity(problemSolved, description) {
    if (!problemSolved || problemSolved.trim().length < 20) {
        return 30; // Low score if problem isn't clearly defined
    }

    const text = `${problemSolved} ${description}`.toLowerCase();
    const problemKeywords = config.relevanceKeywords.problemFocused;

    let matchCount = 0;
    problemKeywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    });

    // Base score for having a problem statement
    let score = 50;

    // Bonus for problem-focused language
    score += Math.min(50, matchCount * 10);

    return Math.round(score);
}

/**
 * Calculate how broadly applicable the template is across different scenarios
 */
function calculateBroadApplicability(description, features, category) {
    const text = `${description} ${features.join(' ')}`.toLowerCase();

    // Check for indicators of broad applicability
    const broadIndicators = [
        'any', 'all', 'various', 'multiple', 'flexible', 'adaptable',
        'reusable', 'generic', 'universal', 'scalable', 'configurable',
        'customizable', 'extensible', 'modular'
    ];

    let indicatorCount = 0;
    broadIndicators.forEach(indicator => {
        if (text.includes(indicator)) {
            indicatorCount++;
        }
    });

    // Base score
    let score = 40;

    // Bonus for broad applicability indicators
    score += Math.min(40, indicatorCount * 8);

    // Bonus if multiple features are listed
    if (features.length >= 3) {
        score += 20;
    }

    return Math.min(100, Math.round(score));
}

/**
 * Calculate relevance across different industries
 */
function calculateIndustryRelevance(description, useCase) {
    const text = `${description} ${useCase}`.toLowerCase();
    const industries = config.industries;

    let matchCount = 0;
    industries.forEach(industry => {
        if (text.includes(industry.toLowerCase())) {
            matchCount++;
        }
    });

    // Score based on how many industries are mentioned or implied
    let score = 50; // Base score

    if (matchCount === 0) {
        // No specific industry means potentially universal
        score = 70;
    } else if (matchCount >= 3) {
        // Multiple industries mentioned = high relevance
        score = 95;
    } else if (matchCount >= 2) {
        score = 85;
    } else {
        score = 60;
    }

    return score;
}

/**
 * Identify applicable industries based on template content
 */
function identifyIndustries(description, useCase) {
    const text = `${description} ${useCase}`.toLowerCase();
    const industries = config.industries;

    const matched = [];
    industries.forEach(industry => {
        if (text.includes(industry.toLowerCase())) {
            matched.push(industry);
        }
    });

    // If no specific industries found, suggest "Technology" and "Other"
    if (matched.length === 0) {
        return ['Technology', 'Other'];
    }

    return matched;
}

/**
 * Categorize template based on content
 */
function categorizeTemplate(description, features) {
    const text = `${description} ${features.join(' ')}`.toLowerCase();

    const categoryKeywords = {
        'UI/UX Design': ['design', 'interface', 'user experience', 'ui', 'ux', 'wireframe', 'prototype', 'mockup'],
        'Software Architecture': ['architecture', 'system design', 'microservices', 'monolith', 'pattern', 'structure'],
        'Development Framework': ['framework', 'library', 'sdk', 'toolkit', 'boilerplate', 'starter'],
        'Workflow Pattern': ['workflow', 'process', 'pipeline', 'automation', 'orchestration'],
        'Business Process': ['business', 'management', 'operations', 'strategy', 'planning'],
        'Data Management': ['data', 'database', 'storage', 'analytics', 'etl', 'pipeline'],
        'Security Pattern': ['security', 'authentication', 'authorization', 'encryption', 'compliance'],
        'DevOps/CI-CD': ['devops', 'ci/cd', 'deployment', 'continuous', 'infrastructure', 'docker', 'kubernetes']
    };

    let bestMatch = 'Other';
    let maxMatches = 0;

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        let matches = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                matches++;
            }
        });

        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = category;
        }
    });

    return bestMatch;
}

/**
 * Extract key features from description
 */
function extractKeyFeatures(description) {
    // Simple extraction based on common patterns
    const features = [];

    // Look for bullet points or numbered lists
    const lines = description.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
            const feature = trimmed.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '').trim();
            if (feature.length > 0 && feature.length < 100) {
                features.push(feature);
            }
        }
    });

    // If no structured features found, return generic ones
    if (features.length === 0) {
        return ['Problem-solving template', 'Industry-applicable', 'Modern approach'];
    }

    return features.slice(0, 8); // Limit to 8 features
}

/**
 * Test function with sample data
 */
export function runTests() {
    console.log('Running Template Evaluator Tests...\n');

    const testTemplates = [
        {
            name: 'Microservices API Gateway Pattern',
            description: 'A cloud-native API gateway pattern that addresses the complexity of managing multiple microservices. Implements authentication, rate limiting, and service discovery for distributed systems.',
            problemSolved: 'Solves the challenge of managing and securing communication between multiple microservices in cloud-native applications',
            useCase: 'Applicable to e-commerce platforms, SaaS applications, and any distributed system requiring centralized API management',
            features: ['Authentication & Authorization', 'Rate Limiting', 'Service Discovery', 'Load Balancing', 'Monitoring & Analytics'],
            category: 'Software Architecture',
            source: 'https://example.com/api-gateway-pattern'
        },
        {
            name: 'Simple Hello World',
            description: 'A basic hello world example',
            problemSolved: 'Prints hello',
            useCase: 'Learning',
            features: [],
            source: 'https://example.com/hello'
        }
    ];

    testTemplates.forEach((template, index) => {
        console.log(`\n--- Test ${index + 1}: ${template.name} ---`);
        const result = evaluateTemplate(template);
        console.log('Score:', result.score);
        console.log('Passes Threshold:', result.passesThreshold);
        console.log('Breakdown:', result.breakdown);
        console.log('Category:', result.metadata.category);
        console.log('Industries:', result.metadata.industries);
        console.log('Key Features:', result.metadata.keyFeatures);
    });
}

// Run tests if executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args.includes('--test')) {
        runTests();
    } else {
        console.log('Template Evaluator Module');
        console.log('Usage: node template-evaluator.js --test');
    }
}
