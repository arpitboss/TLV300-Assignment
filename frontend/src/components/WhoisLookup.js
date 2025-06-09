import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Globe,
    Users,
    AlertCircle,
    CheckCircle,
    Loader2,
    Trash2,
    ChevronRight,
    Star,
    Heart,
    Rocket,
    Wifi,
    Clock,
    Shield,
    Server,
    Mail,
    MapPin,
    Calendar,
    Zap,
    RefreshCw,
    Copy,
    ExternalLink,
    TrendingUp,
    Sparkles,
    Eye,
    Database,
    Activity
} from 'lucide-react';

const WhoisLookup = () => {
    const [domain, setDomain] = useState('');
    const [dataType, setDataType] = useState('domain');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            try {
                return JSON.parse(savedHistory);
            } catch (e) {
                console.error('Failed to parse search history from localStorage', e);
                localStorage.removeItem('searchHistory'); // Clear invalid data
                return [];
            }
        }
        return [];
    });
    const [persistedData, setPersistedData] = useState({
        searchHistory: [],
        lastSearch: null,
        preferences: {}
    });
    const [suggestions] = useState(['amazon.com', 'google.com', 'facebook.com', 'microsoft.com', 'apple.com']);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [responseTime, setResponseTime] = useState(null);
    const [copied, setCopied] = useState(false);

    const [pulseAnimation, setPulseAnimation] = useState(false);

    useEffect(() => {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulseAnimation(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const settings = [
        { label: 'Response Time Tracking', status: 'Enabled', color: 'text-green-400' },
        { label: 'Auto-Refresh', status: 'Disabled', color: 'text-red-400' },
        { label: 'Detailed Logs', status: 'Active', color: 'text-blue-400' },
    ];

    // Mock data for demonstration
    const mockDomainData = {
        domainName: 'example.com',
        registrar: 'GoDaddy LLC',
        registrationDate: '1995-08-14',
        expirationDate: '2025-08-13',
        estimatedDomainAge: '29 years',
        hostnames: 'ns1.example.com, ns2.example.com',
        status: 'clientTransferProhibited',
        lastUpdated: '2024-07-15'
    };

    const mockContactData = {
        registrantName: 'Privacy Protected',
        registrantCity: 'Redacted',
        registrantState: 'Redacted',
        registrantCountry: 'US',
        technicalContactName: 'Privacy Protected',
        administrativeContactName: 'Privacy Protected',
        contactEmail: 'admin@example.com',
        privacyProtected: true
    };

    // Enhanced domain validation
    const validateDomain = (domain) => {
        if (!domain.trim()) {
            return { valid: false, error: 'Please enter a domain name' };
        }

        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '');

        if (cleanDomain.length > 253) {
            return { valid: false, error: 'Domain name is too long' };
        }

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(cleanDomain)) {
            return { valid: false, error: 'Please enter a valid domain name (e.g., example.com)' };
        }

        return { valid: true, domain: cleanDomain };
    };

    const handleSubmit = async () => {
        const validation = validateDomain(domain);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setResponseTime(null);

        const startTime = Date.now();

        // Simulate API call with mock data
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const endTime = Date.now();
            setResponseTime(endTime - startTime);

            const mockResult = {
                domain: validation.domain,
                dataType: dataType,
                data: dataType === 'domain' ? mockDomainData : mockContactData,
                cached: Math.random() > 0.5
            };

            setResult(mockResult);
            saveToHistory(validation.domain, dataType);
        } catch (err) {
            setError('An error occurred while fetching WHOIS data');
        } finally {
            setLoading(false);
        }
    };

    const saveToHistory = useCallback((domain, dataType) => {
        const newEntry = {
            domain,
            dataType,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        const updatedHistory = [newEntry, ...searchHistory.filter(h => h.domain !== domain || h.dataType !== dataType)]
            .slice(0, 10);

        setSearchHistory(updatedHistory);
    }, [searchHistory]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setDomain(suggestion);
        setError('');
    };

    const handleHistoryClick = (historyItem) => {
        setDomain(historyItem.domain);
        setDataType(historyItem.dataType);
        setError('');
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.setItem('searchHistory', JSON.stringify([]));
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const renderDomainInfo = (data) => (
        <div className="space-y-8">
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Domain Age',
                        value: data.estimatedDomainAge,
                        icon: Calendar,
                        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
                        glow: 'shadow-cyan-500/25'
                    },
                    {
                        label: 'Status',
                        value: data.status !== 'N/A' ? 'Active' : 'Unknown',
                        icon: Shield,
                        gradient: 'from-emerald-400 via-green-500 to-teal-600',
                        glow: 'shadow-emerald-500/25'
                    },
                    {
                        label: 'Registrar',
                        value: data.registrar !== 'N/A' ? 'Verified' : 'Unknown',
                        icon: Server,
                        gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
                        glow: 'shadow-violet-500/25'
                    },
                    {
                        label: 'Last Updated',
                        value: data.lastUpdated !== 'N/A' ? 'Recent' : 'Unknown',
                        icon: Activity,
                        gradient: 'from-orange-400 via-red-500 to-pink-600',
                        glow: 'shadow-orange-500/25'
                    }
                ].map((metric, index) => (
                    <div key={index} className={`relative group`}>
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${metric.gradient} rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500`}></div>
                        <div className="relative bg-white rounded-2xl p-6 h-full">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${metric.gradient} mb-4 shadow-lg ${metric.glow}`}>
                                        <metric.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        {metric.label}
                                    </h3>
                                    <p className="text-xl font-bold text-gray-900 leading-tight">
                                        {metric.value}
                                    </p>
                                </div>
                                <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Sparkles className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Information Grid */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                                <Database className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Domain Registry Details</h3>
                                <p className="text-gray-300 text-sm">Complete registration information</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm font-medium">Live Data</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Object.entries({
                            'Domain Name': data.domainName,
                            'Registrar': data.registrar,
                            'Registration Date': data.registrationDate,
                            'Expiration Date': data.expirationDate,
                            'Domain Age': data.estimatedDomainAge,
                            'Hostnames': data.hostnames,
                            'Status': data.status,
                            'Last Updated': data.lastUpdated
                        }).map(([key, value]) => (
                            <div key={key} className="group relative">
                                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                                    <div className="flex-1">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            {key}
                                        </dt>
                                        <dd className={`text-lg font-bold text-gray-900 ${key === 'Hostnames' ? 'break-all text-base' : ''}`}>
                                            {value}
                                        </dd>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(value)}
                                        className="ml-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Copy to clipboard"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContactInfo = (data) => (
        <div className="space-y-8">
            {/* Privacy Notice */}
            {data.privacyProtected && (
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-60"></div>
                    <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-yellow-800 mb-2">Privacy Protection Active</h4>
                                <p className="text-yellow-700 leading-relaxed">
                                    This domain uses privacy protection services. Contact information may be redacted for security purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    {
                        title: 'Registrant',
                        icon: Users,
                        gradient: 'from-blue-500 via-blue-600 to-indigo-700',
                        name: data.registrantName,
                        location: [data.registrantCity, data.registrantState, data.registrantCountry]
                            .filter(item => item !== 'N/A')
                            .join(', '),
                        glow: 'shadow-blue-500/25'
                    },
                    {
                        title: 'Technical Contact',
                        icon: Server,
                        gradient: 'from-emerald-500 via-green-600 to-teal-700',
                        name: data.technicalContactName,
                        glow: 'shadow-emerald-500/25'
                    },
                    {
                        title: 'Administrative Contact',
                        icon: Shield,
                        gradient: 'from-purple-500 via-violet-600 to-fuchsia-700',
                        name: data.administrativeContactName,
                        glow: 'shadow-purple-500/25'
                    }
                ].map((contact, index) => (
                    <div key={index} className="group relative">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${contact.gradient} rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500`}></div>
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                            <div className={`bg-gradient-to-r ${contact.gradient} p-6`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <contact.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{contact.title}</h3>
                                    </div>
                                    <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                        Contact Name
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900">{contact.name}</p>
                                </div>
                                {contact.location && contact.location !== '' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                            Location
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm text-gray-700">{contact.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Email Section */}
            {data.contactEmail !== 'N/A' && (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <Mail className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Primary Contact</h3>
                                    <p className="text-lg text-gray-600">{data.contactEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => copyToClipboard(data.contactEmail)}
                                    className="p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                                    title="Copy email"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                                <a
                                    href={`mailto:${data.contactEmail}`}
                                    className="p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                                    title="Send email"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 py-12">
                {/* Hero Header */}
                <div className="text-center mb-16">
                    <div className="relative inline-block mb-8">
                        {/* Glowing effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative flex items-center justify-center space-x-4">
                            <div className="relative">
                                <Globe className="h-20 w-20 text-white" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                    <Eye className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-7xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                            WHOIS
                        </span>
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent ml-4">
                            Intelligence
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Advanced domain reconnaissance and registry analysis platform
                    </p>

                    <div className="flex items-center justify-center space-x-8 text-sm">
                        {[
                            { icon: Zap, label: 'Lightning Fast', color: 'text-yellow-400' },
                            { icon: Shield, label: 'Enterprise Grade', color: 'text-green-400' },
                            { icon: TrendingUp, label: 'Real-time Data', color: 'text-blue-400' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-gray-300">
                                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                                <span className="font-medium">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Interface */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                            <div className="space-y-8">
                                {/* Domain Input */}
                                <div>
                                    <label className="block text-lg font-bold text-white mb-4">
                                        Target Domain
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Enter domain name (e.g., example.com)"
                                            className="w-full px-8 py-6 pl-16 bg-white/90 backdrop-blur-sm border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg font-medium placeholder-gray-500 shadow-2xl"
                                            disabled={loading}
                                        />
                                        <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                                            <Globe className="h-6 w-6 text-gray-400" />
                                        </div>
                                        {loading && (
                                            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                                                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggestions */}
                                    {!domain && suggestions.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-300 mb-3">Popular examples:</p>
                                            <div className="flex flex-wrap gap-3">
                                                {suggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 text-sm font-medium border border-white/30"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Data Type Selection */}
                                <div>
                                    <label className="block text-lg font-bold text-white mb-4">
                                        Analysis Type
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                value: 'domain',
                                                icon: Globe,
                                                title: 'Domain Intelligence',
                                                description: 'Registration details, nameservers, expiry data',
                                                gradient: 'from-blue-500 to-indigo-600'
                                            },
                                            {
                                                value: 'contact',
                                                icon: Users,
                                                title: 'Contact Information',
                                                description: 'Registrant, admin, technical contacts',
                                                gradient: 'from-purple-500 to-pink-600'
                                            }
                                        ].map((option) => (
                                            <label key={option.value} className={`relative cursor-pointer group`}>
                                                <input
                                                    type="radio"
                                                    value={option.value}
                                                    checked={dataType === option.value}
                                                    onChange={(e) => setDataType(e.target.value)}
                                                    className="sr-only"
                                                    disabled={loading}
                                                />
                                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${dataType === option.value
                                                    ? 'border-white bg-white/20 backdrop-blur-sm shadow-2xl'
                                                    : 'border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/15'
                                                    }`}>
                                                    <div className="flex items-start space-x-4">
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.gradient} flex items-center justify-center shadow-lg`}>
                                                            <option.icon className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-white mb-1">
                                                                {option.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                                {option.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Options */}
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="mb-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {showAdvanced ? 'Hide' : 'Show'} Advanced Mission Control
                                </button>
                                <div
                                    className={`mt-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 transition-all duration-300 ${showAdvanced ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                                        }`}
                                >
                                    <h2 className="text-lg font-semibold mb-4">Advanced Mission Control</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {settings.map((setting, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-xl hover:bg-white/20 transition-colors duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white text-sm font-medium">{setting.label}</span>
                                                    <span className={`text-sm font-bold ${setting.color}`}>{setting.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden"
                                >
                                    {/* Animated background layers */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-2xl opacity-0 ${pulseAnimation ? 'animate-pulse' : ''}`}></div>

                                    {/* Floating particles effect */}
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                        <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
                                        <div className="absolute w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ top: '60%', left: '80%', animationDelay: '0.5s' }}></div>
                                        <div className="absolute w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ top: '80%', left: '30%', animationDelay: '1s' }}></div>
                                    </div>

                                    {/* Button content */}
                                    <div className="relative px-8 py-5 flex items-center justify-center space-x-3 text-white font-bold text-lg transform group-hover:scale-105 transition-transform duration-300">
                                        {loading ? (
                                            <>
                                                <div className="relative">
                                                    <Loader2 className="animate-spin h-6 w-6" />
                                                    <div className="absolute inset-0 animate-ping">
                                                        <Loader2 className="h-6 w-6 opacity-30" />
                                                    </div>
                                                </div>
                                                <span className="animate-pulse">Diving Deep into the Digital Realm...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="h-6 w-6 group-hover:animate-bounce" />
                                                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                                    Launch Domain Explorer
                                                </span>
                                                <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                                            </>
                                        )}
                                    </div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search History Sidebar */}
                    {searchHistory.length > 0 && (
                        <div className="max-w-4xl mx-auto mb-8">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
                                <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                                                    <Clock className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"></div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                    Time Capsule
                                                </h3>
                                                <p className="text-sm text-gray-500">Your recent digital adventures</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={clearHistory}
                                            className="group relative px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full hover:from-red-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Trash2 className="h-4 w-4 group-hover:animate-bounce" />
                                                <span className="text-sm font-medium">Clear All</span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {searchHistory.map((item) => (
                                            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900">{item.domain}</h4>
                                                        <p className="text-sm text-gray-500">{item.dataType === 'domain' ? 'Domain Intelligence' : 'Contact Information'}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-xs text-gray-400">{formatTimeAgo(item.timestamp)}</span>
                                                        <button
                                                            onClick={() => handleHistoryClick(item)}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
                                                        >
                                                            Revisit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Copy Success Message */}
                    {copied && (
                        <div className="fixed top-8 right-8 z-50 transform transition-all duration-500 ease-out">
                            <div className="relative group">
                                {/* Magical glow effect */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>

                                <div className="relative bg-white/95 backdrop-blur-lg border-2 border-green-200 rounded-2xl p-4 shadow-2xl">
                                    <div className="flex items-center space-x-3">
                                        {/* Animated success icon */}
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-white animate-bounce" />
                                            </div>
                                            {/* Sparkle effects */}
                                            <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-spin" />
                                            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-400 animate-pulse" />
                                        </div>

                                        <div>
                                            <p className="font-bold text-green-800">Copied Successfully! ✨</p>
                                            <p className="text-sm text-green-600">Ready to paste anywhere</p>
                                        </div>

                                        {/* Floating hearts */}
                                        <div className="absolute -top-2 right-4 animate-bounce">
                                            <Heart className="h-4 w-4 text-pink-400 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="max-w-4xl mx-auto mb-6">
                            <div className="relative group">
                                {/* Animated error border */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-2xl blur-sm opacity-30 animate-pulse"></div>

                                <div className="relative bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-xl">
                                    <div className="flex items-start space-x-4">
                                        {/* Animated error icon */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                                                <AlertCircle className="h-6 w-6 text-white" />
                                            </div>
                                            {/* Danger indicators */}
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-lg font-bold text-red-800">Oops! Something went wrong</h3>
                                                <div className="animate-spin">
                                                    <Wifi className="h-4 w-4 text-red-600" />
                                                </div>
                                            </div>
                                            <p className="text-red-700 mb-4 leading-relaxed">{error}</p>
                                            <button
                                                onClick={() => setError('')}
                                                className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium">Got it!</span>
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Results */}
                    {result && (
                        <div className="max-w-7xl mx-auto">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
                                <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-emerald-100 overflow-hidden">
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                        <div className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-bounce" style={{ top: '10%', left: '5%', animationDelay: '0s' }}></div>
                                        <div className="absolute w-1 h-1 bg-teal-400/40 rounded-full animate-bounce" style={{ top: '20%', right: '10%', animationDelay: '1s' }}></div>
                                        <div className="absolute w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-bounce" style={{ bottom: '15%', left: '15%', animationDelay: '2s' }}></div>
                                        <div className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-bounce" style={{ bottom: '25%', right: '5%', animationDelay: '1.5s' }}></div>
                                    </div>
                                    <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                        <CheckCircle className="h-8 w-8 text-white animate-pulse" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                                        <Star className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold flex items-center space-x-2">
                                                        <span>
                                                            {result.dataType === 'domain' ? '🌐 Domain Intel' : '👤 Contact Profile'}
                                                        </span>
                                                        <Sparkles className="h-6 w-6 animate-spin" />
                                                    </h3>
                                                    <p className="text-emerald-100 mt-2 flex items-center space-x-2">
                                                        <span>Mission accomplished for:</span>
                                                        <span className="font-bold bg-white/20 px-3 py-1 rounded-full">
                                                            {result.domain}
                                                        </span>
                                                        <Rocket className="h-4 w-4 animate-bounce" />
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className="flex items-center justify-end text-emerald-100 space-x-2">
                                                    {result.cached ? (
                                                        <>
                                                            <Zap className="h-5 w-5 text-yellow-300 animate-pulse" />
                                                            <span className="text-sm bg-yellow-400/20 px-3 py-1 rounded-full">⚡ Lightning Fast</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RefreshCw className="h-5 w-5 text-blue-300 animate-spin" />
                                                            <span className="text-sm bg-blue-400/20 px-3 py-1 rounded-full">🔄 Fresh Data</span>
                                                        </>
                                                    )}
                                                </div>
                                                {responseTime && (
                                                    <div className="flex items-center justify-end text-emerald-100 space-x-2">
                                                        <Clock className="h-4 w-4 text-cyan-300" />
                                                        <span className="text-sm bg-cyan-400/20 px-3 py-1 rounded-full">
                                                            🚀 {responseTime}ms
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
                                            <div className="h-full bg-gradient-to-r from-white/50 to-transparent animate-pulse"></div>
                                        </div>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="p-8 bg-gradient-to-br from-gray-50/50 to-white"
                                    >
                                        {result.dataType === 'domain' ?
                                            renderDomainInfo(result.data) :
                                            renderContactInfo(result.data)
                                        }
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Footer */}
                    <div className="text-center mt-20">
                        <div className="relative group inline-block">
                            {/* Magical footer aura */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>

                            <div className="relative bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border-2 border-white/50 p-8">
                                {/* Floating tech icons around the footer */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                                    <Globe className="h-3 w-3 text-white" />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
                                    <Shield className="h-4 w-4 text-white" />
                                </div>

                                <div className="flex items-center justify-center space-x-8 text-sm">
                                    <div className="group flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 transform hover:scale-105">
                                        <div className="relative">
                                            <Zap className="h-5 w-5 text-yellow-600 group-hover:animate-bounce" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-yellow-700">Supercharged</div>
                                            <div className="text-xs text-yellow-600">WhoisXMLAPI</div>
                                        </div>
                                    </div>

                                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                                    <div className="group flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105">
                                        <div className="relative">
                                            <Globe className="h-5 w-5 text-blue-600 group-hover:animate-spin" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-blue-700">Crafted with</div>
                                            <div className="text-xs text-blue-600">React & Node.js</div>
                                        </div>
                                    </div>

                                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                                    <div className="group flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 transition-all duration-300 transform hover:scale-105">
                                        <div className="relative">
                                            <Shield className="h-5 w-5 text-green-600 group-hover:animate-pulse" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-green-700">Enterprise</div>
                                            <div className="text-xs text-green-600">Security</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtitle with sparkles */}
                                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                                    <Sparkles className="h-3 w-3 text-pink-400 animate-spin" />
                                    <span>Exploring the digital universe, one domain at a time</span>
                                    <Sparkles className="h-3 w-3 text-purple-400 animate-spin" style={{ animationDelay: '0.5s' }} />
                                </div>
                            </div>
                        </div>

                        {/* Floating love message */}
                        <div className="mt-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
                            <p className="text-sm text-gray-400 flex items-center justify-center space-x-2">
                                <span>Made with</span>
                                <Heart className="h-4 w-4 text-red-400 animate-pulse fill-current" />
                                <span>by Arpit Verma</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhoisLookup;