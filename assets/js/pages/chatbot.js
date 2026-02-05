/**
 * OpsMind - AI Chatbot Page Module
 * 
 * Handles chatbot functionality:
 * - Real-time message exchange
 * - AI-powered responses
 * - Quick actions
 * - Chat history
 * - Export functionality
 */

import UI from '/assets/js/ui.js';
import AIService from '/services/aiService.js';
import TicketService from '/services/ticketService.js';

/**
 * Page state
 */
const state = {
    messages: [],
    isTyping: false,
    initialized: false,
    sessionStartTime: new Date(),
    messageCount: 0,
    resolvedQueries: 0
};

/**
 * Initialize the Chatbot page
 */
export async function initChatbotPage() {
    // Prevent double initialization
    if (state.initialized) {
        console.log('[Chatbot] Already initialized, skipping...');
        return;
    }
    
    console.log('[Chatbot] Initializing page...');
    state.initialized = true;
    
    // Mark page as initialized
    document.body.classList.add('chatbot-page-initialized');
    
    try {
        // Initialize event listeners
        initEventListeners();
        
        // Load chat history if exists
        loadChatHistory();
        
        // Update statistics
        updateStatistics();
        
        console.log('[Chatbot] Page initialized successfully');
    } catch (error) {
        console.error('[Chatbot] Initialization error:', error);
        UI.showError('Failed to initialize chatbot');
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Send message button
    const sendBtn = document.getElementById('sendMessageBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }
    
    // Enter key to send
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
    
    // Quick action buttons
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.dataset.message;
            if (message && chatInput) {
                chatInput.value = message;
                handleSendMessage();
            }
        });
    });
    
    // Clear chat button
    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', handleClearChat);
    }
    
    // Export chat button
    const exportChatBtn = document.getElementById('exportChatBtn');
    if (exportChatBtn) {
        exportChatBtn.addEventListener('click', handleExportChat);
    }
    
    // Chat settings button
    const chatSettingsBtn = document.getElementById('chatSettingsBtn');
    if (chatSettingsBtn) {
        chatSettingsBtn.addEventListener('click', () => {
            UI.showToast('Settings feature coming soon!', 'info');
        });
    }
}

/**
 * Handle send message
 */
async function handleSendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    
    if (!chatInput || !sendBtn) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    try {
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get AI response (simulate with delay for demo)
        const response = await getAIResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response to chat
        addMessage(response, 'bot');
        
        // Update statistics
        state.messageCount += 2;
        state.resolvedQueries += 1;
        updateStatistics();
        
        // Save chat history
        saveChatHistory();
        
    } catch (error) {
        console.error('[Chatbot] Error sending message:', error);
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

/**
 * Add message to chat
 */
function addMessage(text, sender, isError = false) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const timestamp = new Date();
    
    // Create message object
    const messageObj = {
        text,
        sender,
        timestamp,
        isError
    };
    
    state.messages.push(messageObj);
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}`;
    avatar.innerHTML = sender === 'bot' ? '<i class="bi bi-robot"></i>' : '<i class="bi bi-person-fill"></i>';
    
    const contentWrapper = document.createElement('div');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    if (isError) {
        contentDiv.style.background = '#fee';
        contentDiv.style.color = '#c00';
        contentDiv.style.borderColor = '#fcc';
    }
    
    const textDiv = document.createElement('div');
    textDiv.innerHTML = formatMessage(text);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(timestamp);
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    contentWrapper.appendChild(contentDiv);
    
    if (sender === 'bot') {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentWrapper);
    } else {
        messageDiv.appendChild(contentWrapper);
        messageDiv.appendChild(avatar);
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Format message text (convert URLs, line breaks, etc.)
 */
function formatMessage(text) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

/**
 * Format timestamp
 */
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) { // Less than 1 day
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    state.isTyping = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar bot">
            <i class="bi bi-robot"></i>
        </div>
        <div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    state.isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Get AI response (mock implementation - replace with actual AI service)
 */
async function getAIResponse(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const lowerMessage = message.toLowerCase();
    
    // Pattern matching for common queries
    if (lowerMessage.includes('create') && lowerMessage.includes('ticket')) {
        return `To create a new ticket:
1. Go to the Tickets page
2. Click the "New Ticket" button
3. Fill in the required details (title, description, priority)
4. Assign to a team or technician
5. Click "Create Ticket"

Would you like me to guide you through the process?`;
    }
    
    if (lowerMessage.includes('my tickets') || lowerMessage.includes('open tickets')) {
        try {
            const tickets = await TicketService.getTickets({ status: 'open', limit: 5 });
            if (tickets && tickets.length > 0) {
                let response = `You have ${tickets.length} open tickets:\n\n`;
                tickets.forEach((ticket, index) => {
                    response += `${index + 1}. #${ticket.id} - ${ticket.title} (${ticket.status})\n`;
                });
                return response;
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
        return 'You currently have no open tickets. Great job! 🎉';
    }
    
    if (lowerMessage.includes('status') && /ticket.*#?\d+/.test(lowerMessage)) {
        return `To check ticket status:
1. Go to the Tickets page
2. Use the search bar to find your ticket number
3. Or click on the ticket to view full details

You can also set up notifications to get automatic updates on ticket status changes.`;
    }
    
    if (lowerMessage.includes('escalate')) {
        return `To escalate a ticket:
1. Open the ticket you want to escalate
2. Click the "Escalate" button in the ticket actions
3. Select the escalation level (Level 2, Level 3, Management)
4. Add a reason for escalation
5. Click "Confirm Escalation"

Escalations typically get responded to within 2 hours.`;
    }
    
    if (lowerMessage.includes('sla') || lowerMessage.includes('service level')) {
        return `📊 Our SLA policies are:

**High Priority:**
- Response time: 1 hour
- Resolution time: 4 hours

**Medium Priority:**
- Response time: 4 hours
- Resolution time: 24 hours

**Low Priority:**
- Response time: 8 hours
- Resolution time: 72 hours

You can view detailed SLA policies in the SLA Policies section.`;
    }
    
    if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
        return `🤖 OpsMind supports powerful workflow automation:

- Auto-assign tickets based on category
- Automatic escalation on SLA breach
- Email notifications and alerts
- Custom approval workflows
- Integration with external tools

Visit the Workflows page to create and manage automations.`;
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return `Hello! 👋 How can I assist you today? I can help with tickets, workflows, SLA policies, and general IT support questions.`;
    }
    
    if (lowerMessage.includes('help')) {
        return `I'm here to help! Here are some things I can assist you with:

🎫 **Ticket Management:** Create, view, and update tickets
📊 **Status Checks:** Check ticket status and history
⚡ **Workflows:** Understand automation and workflows
📈 **SLA Policies:** Information about service level agreements
🔍 **Search:** Find specific tickets or information
🚀 **Escalations:** How to escalate urgent issues

Just ask me anything!`;
    }
    
    if (lowerMessage.includes('thank')) {
        return `You're welcome! 😊 Is there anything else I can help you with?`;
    }
    
    // Default response
    return `I understand you're asking about "${message}". 

While I'm still learning, here are some things I can definitely help with:
- Creating and managing tickets
- Checking ticket status
- SLA policy information
- Workflow automation
- General IT support questions

Could you rephrase your question or ask about one of these topics?`;
}

/**
 * Handle clear chat
 */
async function handleClearChat() {
    const confirmed = await UI.showConfirm(
        'Clear Chat History',
        'Are you sure you want to clear all messages? This action cannot be undone.'
    );
    
    if (confirmed) {
        // Clear messages
        state.messages = [];
        state.messageCount = 0;
        state.resolvedQueries = 0;
        
        // Clear UI
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            
            // Re-add welcome message
            addMessage(`👋 Hello! I'm your OpsMind AI Assistant. I'm here to help you with:
<ul class="mt-2 mb-0">
    <li>Creating and managing tickets</li>
    <li>Checking ticket status and history</li>
    <li>Understanding SLA policies</li>
    <li>Workflow automation questions</li>
    <li>General IT support queries</li>
</ul>`, 'bot');
        }
        
        // Clear local storage
        localStorage.removeItem('opsmind_chat_history');
        
        // Update statistics
        updateStatistics();
        
        UI.showToast('Chat cleared successfully', 'success');
    }
}

/**
 * Handle export chat
 */
function handleExportChat() {
    if (state.messages.length === 0) {
        UI.showToast('No messages to export', 'info');
        return;
    }
    
    // Create export content
    let content = 'OpsMind Chat Export\n';
    content += '===================\n\n';
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `Total Messages: ${state.messages.length}\n\n`;
    content += '-------------------\n\n';
    
    state.messages.forEach((msg) => {
        const sender = msg.sender === 'bot' ? 'AI Assistant' : 'You';
        const time = msg.timestamp.toLocaleString();
        content += `[${time}] ${sender}:\n${msg.text}\n\n`;
    });
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opsmind-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    UI.showToast('Chat exported successfully', 'success');
}

/**
 * Update statistics
 */
function updateStatistics() {
    // Total messages
    const totalMessagesEl = document.getElementById('totalMessagesCount');
    if (totalMessagesEl) {
        totalMessagesEl.textContent = state.messageCount;
    }
    
    // Resolved queries
    const resolvedQueriesEl = document.getElementById('resolvedQueriesCount');
    if (resolvedQueriesEl) {
        resolvedQueriesEl.textContent = state.resolvedQueries;
    }
    
    // Average response time (simulated)
    const avgResponseTimeEl = document.getElementById('avgResponseTime');
    if (avgResponseTimeEl) {
        avgResponseTimeEl.textContent = '< 1s';
    }
    
    // Satisfaction score (simulated)
    const satisfactionScoreEl = document.getElementById('satisfactionScore');
    if (satisfactionScoreEl) {
        satisfactionScoreEl.textContent = '4.8';
    }
}

/**
 * Save chat history to local storage
 */
function saveChatHistory() {
    try {
        const data = {
            messages: state.messages,
            messageCount: state.messageCount,
            resolvedQueries: state.resolvedQueries,
            sessionStartTime: state.sessionStartTime
        };
        localStorage.setItem('opsmind_chat_history', JSON.stringify(data));
    } catch (error) {
        console.error('[Chatbot] Error saving chat history:', error);
    }
}

/**
 * Load chat history from local storage
 */
function loadChatHistory() {
    try {
        const data = localStorage.getItem('opsmind_chat_history');
        if (data) {
            const parsed = JSON.parse(data);
            
            // Check if session is from today
            const sessionDate = new Date(parsed.sessionStartTime);
            const today = new Date();
            
            if (sessionDate.toDateString() === today.toDateString()) {
                // Restore state
                state.messages = parsed.messages || [];
                state.messageCount = parsed.messageCount || 0;
                state.resolvedQueries = parsed.resolvedQueries || 0;
                
                // Restore messages to UI (skip welcome message)
                const messagesContainer = document.getElementById('chatMessages');
                if (messagesContainer && state.messages.length > 0) {
                    // Clear welcome message
                    messagesContainer.innerHTML = '';
                    
                    // Add saved messages
                    state.messages.forEach(msg => {
                        addMessage(msg.text, msg.sender, msg.isError);
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Chatbot] Error loading chat history:', error);
    }
}
