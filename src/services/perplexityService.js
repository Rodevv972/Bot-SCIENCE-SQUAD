const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class PerplexityService {
    constructor() {
        this.apiKey = config.apis.perplexity;
        this.baseURL = 'https://api.perplexity.ai/chat/completions';
    }

    async searchArticles(query) {
        if (!this.apiKey) {
            logger.error('Perplexity API key not configured');
            throw new Error('Perplexity API key not configured');
        }

        try {
            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a scientific article search assistant. Return only the most relevant recent scientific articles with their titles, URLs, and brief descriptions. Focus on peer-reviewed research papers.'
                    },
                    {
                        role: 'user',
                        content: `Find the most interesting and recent scientific articles for this week related to: ${query}. Please provide 3-5 articles with titles, URLs, and brief descriptions.`
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info('Perplexity search completed', { query, articlesFound: true });
            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('Perplexity API error', { error: error.message, query });
            throw new Error(`Failed to search articles: ${error.message}`);
        }
    }

    async validateAndSummarizeArticle(url) {
        if (!this.apiKey) {
            throw new Error('Perplexity API key not configured');
        }

        try {
            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a scientific article validator and summarizer. Analyze the given URL and provide: 1) Whether it\'s a legitimate scientific source, 2) A detailed summary if valid, 3) Key findings and implications.'
                    },
                    {
                        role: 'user',
                        content: `Please analyze this article: ${url}. Is it from a credible scientific source? If yes, provide a comprehensive summary including methodology, key findings, and implications.`
                    }
                ],
                temperature: 0.1,
                max_tokens: 1500
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info('Article validation completed', { url });
            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('Article validation error', { error: error.message, url });
            throw new Error(`Failed to validate article: ${error.message}`);
        }
    }
}

module.exports = PerplexityService;