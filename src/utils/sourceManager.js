const fs = require('fs');
const path = require('path');

const SOURCES_FILE = path.join(__dirname, '../../data/sources.json');

class SourceManager {
    constructor() {
        this.ensureDataDirectory();
        this.loadSources();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(SOURCES_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    loadSources() {
        try {
            if (fs.existsSync(SOURCES_FILE)) {
                const data = fs.readFileSync(SOURCES_FILE, 'utf8');
                this.sources = JSON.parse(data);
            } else {
                // Initialize with default trusted sources
                this.sources = {
                    domains: [
                        'arxiv.org',
                        'nature.com',
                        'science.org',
                        'pnas.org',
                        'cell.com',
                        'nejm.org',
                        'thelancet.com',
                        'bmj.com',
                        'pubmed.ncbi.nlm.nih.gov',
                        'sciencedirect.com',
                        'springer.com',
                        'wiley.com',
                        'ieee.org',
                        'acm.org',
                        'aaas.org'
                    ],
                    lastUpdated: new Date().toISOString(),
                    addedBy: 'system'
                };
                this.saveSources();
            }
        } catch (error) {
            console.error('Error loading sources:', error);
            this.sources = { domains: [], lastUpdated: new Date().toISOString() };
        }
    }

    saveSources() {
        try {
            fs.writeFileSync(SOURCES_FILE, JSON.stringify(this.sources, null, 2));
        } catch (error) {
            console.error('Error saving sources:', error);
        }
    }

    getDomains() {
        return this.sources.domains || [];
    }

    addSource(domain, addedBy = 'unknown') {
        if (!this.sources.domains.includes(domain)) {
            this.sources.domains.push(domain);
            this.sources.lastUpdated = new Date().toISOString();
            this.sources.addedBy = addedBy;
            this.saveSources();
            return true;
        }
        return false;
    }

    removeSource(domain) {
        const index = this.sources.domains.indexOf(domain);
        if (index > -1) {
            this.sources.domains.splice(index, 1);
            this.sources.lastUpdated = new Date().toISOString();
            this.saveSources();
            return true;
        }
        return false;
    }

    isValidSource(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            
            return this.sources.domains.some(domain => {
                return hostname === domain || hostname.endsWith('.' + domain);
            });
        } catch (error) {
            return false;
        }
    }

    getSourcesInfo() {
        return {
            count: this.sources.domains.length,
            lastUpdated: this.sources.lastUpdated,
            domains: this.sources.domains
        };
    }
}

module.exports = SourceManager;