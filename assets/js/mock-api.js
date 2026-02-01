/**
 * OpsMind - Mock API Server
 * 
 * This file provides mock API responses for development and demo purposes.
 * It intercepts fetch calls and returns mock data when the real backend is unavailable.
 * 
 * To enable: Include this script before other modules
 * To disable: Remove or comment out this script
 */

(function() {
    'use strict';

    // Configuration
    const MOCK_DELAY = 300; // Simulate network latency
    const API_BASE = '/api';
    const DEMO_AUTO_LOGIN = true; // Set to true to auto-login for demo

    // Auto-login for demo mode
    if (DEMO_AUTO_LOGIN) {
        const path = window.location.pathname;
        const isProtectedPage = path.includes('dashboard') || path.includes('tickets') || path.includes('workflows');
        const hasToken = localStorage.getItem('opsmind_token');
        
        console.log('[Mock API] Path:', path, 'Protected:', isProtectedPage, 'Has token:', !!hasToken);
        
        if (isProtectedPage && !hasToken) {
            console.log('[Mock API] Demo mode: Setting up demo user session');
            const token = 'demo-token-' + Date.now();
            const user = {
                id: '4',
                email: 'demo@opsmind.io',
                name: 'Demo User',
                role: 'technician'
            };
            localStorage.setItem('opsmind_token', token);
            localStorage.setItem('opsmind_user', JSON.stringify(user));
            console.log('[Mock API] Token set:', token);
        }
    }

    // Mock user database
    const users = [
        { id: '1', email: 'admin@opsmind.io', password: 'admin123', name: 'Admin User', role: 'admin' },
        { id: '2', email: 'tech@opsmind.io', password: 'tech123', name: 'John Smith', role: 'technician' },
        { id: '3', email: 'manager@opsmind.io', password: 'manager123', name: 'Sarah Wilson', role: 'manager' },
        { id: '4', email: 'demo@opsmind.io', password: 'demo', name: 'Demo User', role: 'technician' }
    ];

    // Mock token storage
    let activeTokens = {};

    // Mock data generators
    const mockData = {
        tickets: generateMockTickets(),
        workflows: generateMockWorkflows(),
        executions: generateMockExecutions()
    };

    /**
     * Generate mock tickets
     */
    function generateMockTickets() {
        const subjects = [
            'Email not syncing on mobile devices',
            'VPN connection drops frequently',
            'Printer not responding in Finance',
            'Software license activation failed',
            'Network slow in Building B',
            'New laptop setup required',
            'Access request for SharePoint',
            'Password reset not working',
            'Monitor flickering issue',
            'Application crashing on startup',
            'Outlook freezing when opening attachments',
            'WiFi connectivity issues in Conference Room A',
            'Need access to project management tool',
            'Computer running very slow',
            'Unable to connect to shared drive'
        ];

        const statuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
        const priorities = ['low', 'medium', 'high', 'critical'];
        const categories = ['hardware', 'software', 'network', 'security', 'access'];
        const assignees = ['John Smith', 'Sarah Wilson', 'Mike Johnson', 'Lisa Chen', null];
        const requesters = ['alice@company.com', 'bob@company.com', 'carol@company.com', 'david@company.com', 'emma@company.com'];

        return subjects.map((subject, index) => ({
            id: `TKT-${1250 - index}`,
            subject,
            description: `Detailed description for: ${subject}. The user reported this issue and needs assistance. Initial troubleshooting steps have been attempted but the issue persists.`,
            requester: requesters[index % requesters.length],
            requesterName: requesters[index % requesters.length].split('@')[0].replace(/^\w/, c => c.toUpperCase()),
            assignee: assignees[index % assignees.length],
            status: statuses[index % statuses.length],
            priority: priorities[index % priorities.length],
            category: categories[index % categories.length],
            createdAt: new Date(Date.now() - (index * 3600000 * (Math.random() * 24 + 1))).toISOString(),
            updatedAt: new Date(Date.now() - (index * 1800000)).toISOString()
        }));
    }

    /**
     * Generate mock workflows
     */
    function generateMockWorkflows() {
        return [
            {
                id: 'wf-001',
                name: 'Auto-Assignment',
                description: 'Automatically assigns new tickets to available technicians based on workload and expertise.',
                trigger: 'ticket_created',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
                lastExecuted: new Date(Date.now() - 1800000).toISOString(),
                totalRuns: 245,
                steps: [
                    { id: 1, name: 'Check ticket category', type: 'condition' },
                    { id: 2, name: 'Find available technician', type: 'action' },
                    { id: 3, name: 'Assign ticket', type: 'action' },
                    { id: 4, name: 'Send notification', type: 'notification' }
                ]
            },
            {
                id: 'wf-002',
                name: 'SLA Escalation',
                description: 'Escalates tickets that are approaching SLA breach to senior support staff.',
                trigger: 'sla_breach',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
                lastExecuted: new Date(Date.now() - 7200000).toISOString(),
                totalRuns: 89,
                steps: [
                    { id: 1, name: 'Check SLA status', type: 'condition' },
                    { id: 2, name: 'Update priority', type: 'action' },
                    { id: 3, name: 'Escalate to manager', type: 'action' },
                    { id: 4, name: 'Send alert', type: 'notification' }
                ]
            },
            {
                id: 'wf-003',
                name: 'Password Reset Automation',
                description: 'Automates password reset requests with security verification.',
                trigger: 'ticket_created',
                status: 'active',
                createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
                lastExecuted: new Date(Date.now() - 3600000).toISOString(),
                totalRuns: 512,
                steps: [
                    { id: 1, name: 'Verify user identity', type: 'condition' },
                    { id: 2, name: 'Reset password', type: 'action' },
                    { id: 3, name: 'Send credentials', type: 'notification' },
                    { id: 4, name: 'Close ticket', type: 'action' }
                ]
            }
        ];
    }

    /**
     * Generate mock executions
     */
    function generateMockExecutions() {
        return [
            {
                id: 'exec-001',
                workflowId: 'wf-001',
                workflowName: 'Auto-Assignment',
                trigger: 'Ticket Created',
                status: 'completed',
                startedAt: new Date(Date.now() - 1800000).toISOString(),
                duration: 3200,
                triggeredBy: 'System',
                steps: [
                    { name: 'Check ticket category', status: 'completed', startedAt: new Date(Date.now() - 1800000).toISOString(), message: 'Category: Software' },
                    { name: 'Find available technician', status: 'completed', startedAt: new Date(Date.now() - 1798000).toISOString(), message: 'Found: John Smith' },
                    { name: 'Assign ticket', status: 'completed', startedAt: new Date(Date.now() - 1796000).toISOString(), message: 'Ticket assigned successfully' },
                    { name: 'Send notification', status: 'completed', startedAt: new Date(Date.now() - 1794000).toISOString(), message: 'Email sent to john@company.com' }
                ]
            },
            {
                id: 'exec-002',
                workflowId: 'wf-003',
                workflowName: 'Password Reset Automation',
                trigger: 'Ticket Created',
                status: 'running',
                startedAt: new Date(Date.now() - 300000).toISOString(),
                duration: null,
                triggeredBy: 'System',
                steps: [
                    { name: 'Verify user identity', status: 'completed', startedAt: new Date(Date.now() - 300000).toISOString(), message: 'Identity verified' },
                    { name: 'Reset password', status: 'running', startedAt: new Date(Date.now() - 200000).toISOString(), message: 'Processing...' }
                ]
            }
        ];
    }

    /**
     * Generate a random token
     */
    function generateToken() {
        return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    /**
     * Parse path to route parameters
     */
    function matchRoute(path, pattern) {
        const pathParts = path.split('/');
        const patternParts = pattern.split('/');
        
        if (pathParts.length !== patternParts.length) return null;
        
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }

    /**
     * Mock API route handlers
     */
    const routes = {
        'POST /api/auth/login': (body) => {
            const user = users.find(u => u.email === body.email && u.password === body.password);
            if (!user) {
                return { status: 401, body: { message: 'Invalid credentials' } };
            }
            const token = generateToken();
            activeTokens[token] = user.id;
            return {
                status: 200,
                body: {
                    token,
                    user: { id: user.id, email: user.email, name: user.name, role: user.role }
                }
            };
        },

        'POST /api/auth/logout': () => {
            return { status: 200, body: { success: true } };
        },

        'GET /api/auth/validate': (body, headers) => {
            const token = headers.get('Authorization')?.replace('Bearer ', '');
            const userId = activeTokens[token];
            if (!userId) {
                return { status: 401, body: { message: 'Invalid token' } };
            }
            const user = users.find(u => u.id === userId);
            return { status: 200, body: { valid: true, user } };
        },

        'GET /api/tickets': (body, headers, url) => {
            const params = new URLSearchParams(url.split('?')[1]);
            let tickets = [...mockData.tickets];
            
            // Apply filters
            if (params.get('status')) {
                tickets = tickets.filter(t => t.status === params.get('status'));
            }
            if (params.get('priority')) {
                tickets = tickets.filter(t => t.priority === params.get('priority'));
            }
            if (params.get('search')) {
                const search = params.get('search').toLowerCase();
                tickets = tickets.filter(t => 
                    t.subject.toLowerCase().includes(search) || 
                    t.id.toLowerCase().includes(search)
                );
            }

            const page = parseInt(params.get('page')) || 1;
            const limit = parseInt(params.get('limit')) || 10;
            const start = (page - 1) * limit;
            const paginatedTickets = tickets.slice(start, start + limit);

            return {
                status: 200,
                body: {
                    tickets: paginatedTickets,
                    total: tickets.length,
                    page,
                    limit,
                    totalPages: Math.ceil(tickets.length / limit)
                }
            };
        },

        'GET /api/tickets/statistics': () => {
            return {
                status: 200,
                body: {
                    open: 24,
                    inProgress: 18,
                    pending: 8,
                    resolved: 156,
                    slaViolations: 3,
                    openChange: '-12%',
                    inProgressChange: '0%',
                    slaChange: '+2'
                }
            };
        },

        'GET /api/tickets/high-priority': () => {
            const highPriority = mockData.tickets
                .filter(t => t.priority === 'critical' || t.priority === 'high')
                .filter(t => t.status !== 'closed' && t.status !== 'resolved')
                .slice(0, 5);
            return { status: 200, body: { tickets: highPriority } };
        },

        'GET /api/tickets/activity': () => {
            return {
                status: 200,
                body: [
                    { type: 'ticket_created', message: 'New ticket created: "Email not syncing"', user: 'John Smith', time: new Date(Date.now() - 300000).toISOString() },
                    { type: 'ticket_resolved', message: 'Ticket #1234 resolved', user: 'Sarah Wilson', time: new Date(Date.now() - 900000).toISOString() },
                    { type: 'workflow_triggered', message: 'Auto-assignment workflow executed', user: 'System', time: new Date(Date.now() - 1800000).toISOString() },
                    { type: 'sla_warning', message: 'SLA warning: Ticket #1198 approaching deadline', user: 'System', time: new Date(Date.now() - 3600000).toISOString() }
                ]
            };
        },

        'GET /api/tickets/trends': () => {
            const days = 8;
            const labels = [];
            const created = [];
            const resolved = [];
            
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                created.push(Math.floor(Math.random() * 15) + 5);
                resolved.push(Math.floor(Math.random() * 12) + 3);
            }
            
            return { status: 200, body: { labels, created, resolved } };
        },

        'POST /api/tickets': (body) => {
            const newTicket = {
                id: `TKT-${1260 + mockData.tickets.length}`,
                ...body,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            mockData.tickets.unshift(newTicket);
            return { status: 201, body: newTicket };
        },

        'GET /api/users/assignees': () => {
            return {
                status: 200,
                body: [
                    { id: '2', name: 'John Smith' },
                    { id: '3', name: 'Sarah Wilson' },
                    { id: '4', name: 'Mike Johnson' },
                    { id: '5', name: 'Lisa Chen' }
                ]
            };
        },

        'GET /api/workflows': () => {
            return { status: 200, body: { workflows: mockData.workflows } };
        },

        'GET /api/workflows/statistics': () => {
            return {
                status: 200,
                body: {
                    total: 12,
                    active: 8,
                    running: 2,
                    executionsToday: 15
                }
            };
        },

        'GET /api/workflows/active': () => {
            return {
                status: 200,
                body: [
                    { id: 'WF-001', name: 'Auto-Assignment', trigger: 'Ticket Created', status: 'running', progress: 65 },
                    { id: 'WF-003', name: 'SLA Escalation', trigger: 'SLA Breach', status: 'running', progress: 30 }
                ]
            };
        },

        'GET /api/workflows/executions': () => {
            return { status: 200, body: { executions: mockData.executions } };
        },

        'POST /api/workflows/:id/execute': () => {
            return { status: 200, body: { executionId: 'exec-' + Date.now(), status: 'running' } };
        },

        'GET /api/ai/recommendations/:ticketId': () => {
            return {
                status: 200,
                body: [
                    { text: 'Consider escalating to network team based on similar resolved tickets' },
                    { text: 'Similar issue resolved by restarting the VPN service' },
                    { text: 'Knowledge base article KB-2341 may be relevant' }
                ]
            };
        },

        'GET /api/ai/recommendations/count': () => {
            return { status: 200, body: { count: 12, pending: 5 } };
        }
    };

    /**
     * Handle a mock API request
     */
    function handleMockRequest(method, url, body, headers) {
        // Extract path from full URL
        const urlObj = new URL(url, window.location.origin);
        const path = urlObj.pathname;

        // Try exact match first
        const routeKey = `${method} ${path}`;
        if (routes[routeKey]) {
            return routes[routeKey](body, headers, url);
        }

        // Try pattern matching for dynamic routes
        for (const [pattern, handler] of Object.entries(routes)) {
            const [routeMethod, routePath] = pattern.split(' ');
            if (routeMethod !== method) continue;
            
            const params = matchRoute(path, routePath);
            if (params) {
                return handler(body, headers, url, params);
            }
        }

        // Default 404
        return { status: 404, body: { message: 'Not found' } };
    }

    /**
     * Intercept fetch for API calls
     */
    const originalFetch = window.fetch;
    window.fetch = async function(input, init = {}) {
        const url = typeof input === 'string' ? input : input.url;
        
        // Only intercept API calls
        if (!url.includes('/api/')) {
            return originalFetch.apply(this, arguments);
        }

        // Use mock data directly in demo mode
        console.log('[Mock API] Using mock data for:', url);
        
        const method = init.method || 'GET';
        const body = init.body ? JSON.parse(init.body) : null;
        const headers = new Headers(init.headers || {});

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

        const result = handleMockRequest(method, url, body, headers);

        return new Response(JSON.stringify(result.body), {
            status: result.status,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    console.log('[Mock API] Mock API interceptor initialized');
    console.log('[Mock API] Demo credentials: demo@opsmind.io / demo');
})();
