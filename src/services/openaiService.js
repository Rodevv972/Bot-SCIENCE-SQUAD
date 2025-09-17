const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class OpenAIService {
    constructor() {
        this.apiKey = config.apis.openai;
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
    }

    async summarizeArticle(content, url = null) {
        if (!this.apiKey) {
            logger.error('OpenAI API key not configured');
            throw new Error('OpenAI API key not configured');
        }

        try {
            const response = await axios.post(this.baseURL, {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a scientific article summarizer. Create clear, concise summaries that highlight key findings, methodology, and implications for the scientific community. Format your response for Discord with proper sections.'
                    },
                    {
                        role: 'user',
                        content: `Please summarize this scientific article:\n\n${content}\n\n${url ? `URL: ${url}` : ''}\n\nProvide a structured summary with:\n1. Main findings\n2. Methodology\n3. Implications\n4. Key takeaways`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info('OpenAI summary completed', { url, success: true });
            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('OpenAI API error', { error: error.message, url });
            throw new Error(`Failed to summarize article: ${error.message}`);
        }
    }

    async generateTitle(content) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const response = await axios.post(this.baseURL, {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a compelling, informative title for a scientific article summary. The title should be engaging but accurate.'
                    },
                    {
                        role: 'user',
                        content: `Create a title for this article summary: ${content.substring(0, 500)}...`
                    }
                ],
                temperature: 0.5,
                max_tokens: 100
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content.replace(/"/g, '');
        } catch (error) {
            logger.error('Title generation error', { error: error.message });
            return 'Weekly Scientific Paper Summary';
        }
    }
}

module.exports = OpenAIService;