const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Enhanced CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Cache for storing recent lookups (in-memory cache)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Helper function to calculate domain age with more precision
function calculateDomainAge(registrationDate) {
    if (!registrationDate) return 'N/A';

    try {
        const regDate = new Date(registrationDate);
        const currentDate = new Date();

        if (regDate > currentDate) return 'Future date';

        const diffTime = currentDate - regDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = Math.floor(diffDays / 365);
        const remainingDays = diffDays % 365;
        const diffMonths = Math.floor(remainingDays / 30);

        if (diffYears > 0) {
            if (diffMonths > 0) {
                return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
            }
            return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
        } else if (diffMonths > 0) {
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }
    } catch (error) {
        console.error('Error calculating domain age:', error);
        return 'N/A';
    }
}

// Enhanced hostname formatting with better truncation
function formatHostnames(nameServers) {
    if (!nameServers || !Array.isArray(nameServers) || nameServers.length === 0) {
        return 'N/A';
    }

    // Remove duplicates and sort
    const uniqueHostnames = [...new Set(nameServers)].sort();
    const hostnames = uniqueHostnames.join(', ');

    if (hostnames.length > 25) {
        // Try to truncate at a comma boundary if possible
        const truncated = hostnames.substring(0, 22);
        const lastComma = truncated.lastIndexOf(',');
        if (lastComma > 10) {
            return truncated.substring(0, lastComma) + '...';
        }
        return truncated + '...';
    }
    return hostnames;
}

// Enhanced date formatting with timezone handling
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Enhanced domain validation
function validateDomain(domain) {
    if (!domain || typeof domain !== 'string') {
        return { valid: false, error: 'Domain is required' };
    }

    const cleanDomain = domain.trim().toLowerCase();

    // Remove protocol if present
    const domainWithoutProtocol = cleanDomain.replace(/^https?:\/\//, '');

    // Basic domain regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

    if (!domainRegex.test(domainWithoutProtocol)) {
        return { valid: false, error: 'Invalid domain format' };
    }

    if (domainWithoutProtocol.length > 253) {
        return { valid: false, error: 'Domain name too long' };
    }

    return { valid: true, domain: domainWithoutProtocol };
}

// Enhanced domain information extraction
function extractDomainInfo(whoisData) {
    try {
        const registryData = whoisData.WhoisRecord?.registryData || whoisData.WhoisRecord;
        const audit = whoisData.WhoisRecord?.audit || {};

        const domainInfo = {
            domainName: registryData?.domainName || 'N/A',
            registrar: registryData?.registrarName || 'N/A',
            registrationDate: formatDate(registryData?.createdDate),
            expirationDate: formatDate(registryData?.expiresDate),
            estimatedDomainAge: calculateDomainAge(registryData?.createdDate),
            hostnames: formatHostnames(registryData?.nameServers?.hostNames),
            status: registryData?.status || 'N/A',
            lastUpdated: formatDate(registryData?.updatedDate),
            registrarUrl: registryData?.registrarIANAID ? `https://www.iana.org/assignments/registrar-ids/registrar-ids.xhtml` : 'N/A'
        };

        return domainInfo;
    } catch (error) {
        console.error('Error extracting domain info:', error);
        throw new Error('Failed to parse domain information');
    }
}

// Enhanced contact information extraction
function extractContactInfo(whoisData) {
    try {
        const contactInfo = whoisData.WhoisRecord?.contactInfo || {};
        const registryData = whoisData.WhoisRecord?.registryData || whoisData.WhoisRecord;

        // Extract contact details with fallbacks
        const contacts = {
            registrantName: contactInfo.registrant?.name ||
                contactInfo.registrant?.organization ||
                'N/A',
            technicalContactName: contactInfo.technical?.name ||
                contactInfo.technical?.organization ||
                'N/A',
            administrativeContactName: contactInfo.administrative?.name ||
                contactInfo.administrative?.organization ||
                'N/A',
            contactEmail: contactInfo.registrant?.email ||
                contactInfo.administrative?.email ||
                contactInfo.technical?.email ||
                'N/A',
            registrantCountry: contactInfo.registrant?.country || 'N/A',
            registrantState: contactInfo.registrant?.state || 'N/A',
            registrantCity: contactInfo.registrant?.city || 'N/A',
            privacyProtected: registryData?.domainName?.includes('REDACTED') ||
                contactInfo.registrant?.name?.includes('REDACTED') ||
                false
        };

        return contacts;
    } catch (error) {
        console.error('Error extracting contact info:', error);
        throw new Error('Failed to parse contact information');
    }
}

// Cache management functions
function getCacheKey(domain, dataType) {
    return `${domain.toLowerCase()}_${dataType}`;
}

function getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key); // Remove expired cache
    return null;
}

function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (cache.size > 100) {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                cache.delete(key);
            }
        }
    }
}

// Main WHOIS lookup endpoint with enhanced features
app.post('/api/whois', async (req, res) => {
    const startTime = Date.now();

    try {
        const { domain, dataType } = req.body;

        // Enhanced input validation
        const domainValidation = validateDomain(domain);
        if (!domainValidation.valid) {
            return res.status(400).json({
                error: domainValidation.error,
                code: 'INVALID_DOMAIN'
            });
        }

        if (!dataType || !['domain', 'contact'].includes(dataType)) {
            return res.status(400).json({
                error: 'Data type must be either "domain" or "contact"',
                code: 'INVALID_DATA_TYPE'
            });
        }

        const cleanDomain = domainValidation.domain;

        // Check cache first
        const cacheKey = getCacheKey(cleanDomain, dataType);
        const cachedResult = getFromCache(cacheKey);

        if (cachedResult) {
            console.log(`Cache hit for ${cleanDomain}`);
            return res.json({
                ...cachedResult,
                cached: true,
                responseTime: Date.now() - startTime
            });
        }

        // Check for API key
        const apiKey = process.env.WHOIS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'WHOIS API key not configured',
                code: 'MISSING_API_KEY'
            });
        }

        // Prepare API request
        const whoisUrl = 'https://www.whoisxmlapi.com/whoisserver/WhoisService';
        const params = {
            apiKey: apiKey,
            domainName: cleanDomain,
            outputFormat: 'JSON',
            da: 1, // Include domain availability
            ip: 1  // Include IP information
        };

        console.log(`Fetching WHOIS data for domain: ${cleanDomain} (type: ${dataType})`);

        // Make API request with enhanced error handling
        const response = await axios.get(whoisUrl, {
            params,
            timeout: 15000, // 15 second timeout
            headers: {
                'User-Agent': 'WHOIS-Lookup-Tool/1.0'
            }
        });

        // Enhanced response validation
        if (!response.data) {
            return res.status(502).json({
                error: 'Invalid response from WHOIS service',
                code: 'INVALID_RESPONSE'
            });
        }

        if (!response.data.WhoisRecord) {
            return res.status(404).json({
                error: 'No WHOIS data found for this domain',
                code: 'NO_DATA_FOUND',
                domain: cleanDomain
            });
        }

        // Extract the requested data type
        let result;
        try {
            if (dataType === 'domain') {
                result = extractDomainInfo(response.data);
            } else {
                result = extractContactInfo(response.data);
            }
        } catch (extractError) {
            console.error('Data extraction error:', extractError);
            return res.status(500).json({
                error: 'Failed to process WHOIS data',
                code: 'EXTRACTION_ERROR'
            });
        }

        const responseData = {
            success: true,
            dataType: dataType,
            domain: cleanDomain,
            data: result,
            cached: false,
            responseTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };

        // Cache the result
        setCache(cacheKey, responseData);

        res.json(responseData);

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('WHOIS lookup error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            responseTime
        });

        // Enhanced error handling with specific error codes
        if (error.code === 'ENOTFOUND') {
            return res.status(503).json({
                error: 'DNS resolution failed - unable to connect to WHOIS service',
                code: 'DNS_ERROR',
                responseTime
            });
        }

        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
            return res.status(503).json({
                error: 'Connection refused by WHOIS service',
                code: 'CONNECTION_ERROR',
                responseTime
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                error: 'Invalid or expired API key',
                code: 'AUTHENTICATION_ERROR',
                responseTime
            });
        }

        if (error.response?.status === 403) {
            return res.status(403).json({
                error: 'API quota exceeded or access denied',
                code: 'QUOTA_EXCEEDED',
                responseTime
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded - please try again later',
                code: 'RATE_LIMITED',
                responseTime
            });
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return res.status(408).json({
                error: 'Request timeout - the WHOIS service is taking too long to respond',
                code: 'TIMEOUT_ERROR',
                responseTime
            });
        }

        // Generic server error
        res.status(500).json({
            error: 'Internal server error occurred during WHOIS lookup',
            code: 'INTERNAL_ERROR',
            responseTime
        });
    }
});

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
    const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cache: {
            size: cache.size,
            maxAge: CACHE_DURATION / 1000 + 's'
        },
        environment: process.env.NODE_ENV || 'development'
    };

    res.json(healthData);
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'WHOIS Lookup API',
        version: '1.2.0',
        description: 'Enhanced WHOIS domain lookup service',
        endpoints: {
            '/api/whois': 'POST - Domain WHOIS lookup',
            '/api/health': 'GET - Health check',
            '/api/info': 'GET - API information'
        },
        features: [
            'Domain and contact information lookup',
            'Input validation and sanitization',
            'Response caching',
            'Rate limiting',
            'Enhanced error handling',
            'Security headers'
        ]
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.originalUrl
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(500).json({
        error: 'Internal server error',
        code: 'UNHANDLED_ERROR',
        requestId: Date.now().toString(36)
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server with enhanced logging
app.listen(PORT, () => {
    console.log(`🚀 Enhanced WHOIS API Server running at http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`ℹ️  API info: http://localhost:${PORT}/api/info`);
    console.log(`🛡️  Security: Rate limiting enabled (100 req/15min)`);
    console.log(`💾 Caching: Enabled (${CACHE_DURATION / 1000}s TTL)`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;