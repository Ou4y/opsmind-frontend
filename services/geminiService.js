/**
 * OpsMind - AI Service (via Ollama Local)
 * 
 * Handles integration with Ollama running locally
 * for natural language processing and intelligent chatbot responses.
 */

// Ollama Configuration
const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2'; // Change to your installed model: llama2, llama3, mistral, codellama, etc.

/**
 * GeminiService - Service for AI integration via Ollama (keeping name for compatibility)
 */
const GeminiService = {
    /**
     * Generate a response using Ollama running locally
     * @param {string} message - User's message
     * @param {Array} conversationHistory - Previous messages for context (optional)
     * @returns {Promise<string>} AI-generated response
     */
    async generateResponse(message, conversationHistory = []) {
        try {
            // Build the conversation context
            const systemContext = this._buildContext(conversationHistory);
            
            // Prepare messages array for Ollama format
            const messages = [
                {
                    role: 'system',
                    content: systemContext
                },
                // Add recent conversation history
                ...this._formatConversationHistory(conversationHistory),
                {
                    role: 'user',
                    content: message
                }
            ];

            // Prepare the request payload for Ollama
            const requestBody = {
                model: MODEL_NAME,
                messages: messages,
                stream: false, // Set to false for complete response
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 1024, // Max tokens
                }
            };

            console.log('[Ollama] Sending request to local Ollama server...');
            console.log('[Ollama] Model:', MODEL_NAME);

            // Make the API request to local Ollama
            const response = await fetch(OLLAMA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorMessage = `Ollama API error: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error('[Ollama] API Error:', errorData);
                } catch (e) {
                    console.error('[Ollama] API Error:', response.status, response.statusText);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('[Ollama] Response received:', data);

            // Extract the response text (Ollama format)
            const aiResponse = data.message?.content;
            
            if (!aiResponse) {
                throw new Error('No response generated from Ollama');
            }

            return aiResponse.trim();

        } catch (error) {
            console.error('[Ollama] Error generating response:', error);
            
            // Provide helpful error messages
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to Ollama. Please make sure Ollama is running locally on port 11434. Run: ollama serve');
            }
            
            throw error;
        }
    },

    /**
     * Format conversation history for Ollama messages format
     * @param {Array} conversationHistory - Array of previous messages
     * @returns {Array} Formatted messages array
     */
    _formatConversationHistory(conversationHistory) {
        const recentMessages = conversationHistory.slice(-5); // Last 5 messages
        return recentMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    },

    /**
     * Build conversation context for the AI
     * @param {Array} conversationHistory - Array of previous messages
     * @returns {string} Formatted context string
     */
    _buildContext(conversationHistory) {
        let context = `You are OpsMind AI Assistant, a helpful IT support chatbot for the OpsMind IT Service Management platform. 

Your role is to:
- Help users with IT support questions
- Guide users through ticket creation and management
- Explain SLA policies and workflows
- Provide information about the OpsMind platform features
- Answer general IT support questions

Key OpsMind features you should know about:
- Ticket Management: Users can create, view, update, and manage IT support tickets
- Workflows: Automated processes for handling tickets
- SLA Policies: Service Level Agreements with defined response and resolution times
- AI Insights: AI-powered predictions for SLA breach risks
- Priority Levels: High (1hr response, 4hr resolution), Medium (4hr response, 24hr resolution), Low (8hr response, 72hr resolution)

Be helpful, concise, and professional. If you don't know something specific about OpsMind, be honest and suggest they contact support or check the documentation.

`;

        // Add recent conversation history for context (last 5 messages)
        const recentMessages = conversationHistory.slice(-5);
        if (recentMessages.length > 0) {
            context += '\nRecent conversation:\n';
            recentMessages.forEach(msg => {
                const sender = msg.sender === 'user' ? 'User' : 'Assistant';
                context += `${sender}: ${msg.text}\n`;
            });
        }

        return context;
    },

    /**
     * Check if the message should use a quick response (pattern-based)
     * @param {string} message - User's message
     * @returns {string|null} Quick response if matched, null otherwise
     */
    getQuickResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Greetings
        if (/^(hello|hi|hey|good morning|good afternoon|good evening)$/i.test(message.trim())) {
            return `Hello! 👋 How can I assist you today? I can help with tickets, workflows, SLA policies, and general IT support questions.`;
        }

        // Thank you
        if (lowerMessage.includes('thank')) {
            return `You're welcome! 😊 Is there anything else I can help you with?`;
        }

        // Create ticket - Quick action response
        if (lowerMessage.includes('create') && lowerMessage.includes('ticket')) {
            return `To create a new ticket:
1. Go to the Tickets page
2. Click the "New Ticket" button
3. Fill in the required details (title, description, priority)
4. Assign to a team or technician
5. Click "Create Ticket"

Would you like me to guide you through the process?`;
        }

        // Check status - Quick action response
        if (lowerMessage.includes('status') && /ticket.*#?\d+/.test(lowerMessage)) {
            return `To check ticket status:
1. Go to the Tickets page
2. Use the search bar to find your ticket number
3. Or click on the ticket to view full details

You can also set up notifications to get automatic updates on ticket status changes.`;
        }

        // Escalate ticket - Quick action response
        if (lowerMessage.includes('escalate')) {
            return `To escalate a ticket:
1. Open the ticket you want to escalate
2. Click the "Escalate" button in the ticket actions
3. Select the escalation level (Level 2, Level 3, Management)
4. Add a reason for escalation
5. Click "Confirm Escalation"

Escalations typically get responded to within 2 hours.`;
        }

        // SLA policies - Quick action response
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

        // Help - Quick action response
        if (lowerMessage === 'help' || lowerMessage === 'help me') {
            return `I'm here to help! Here are some things I can assist you with:

🎫 **Ticket Management:** Create, view, and update tickets
📊 **Status Checks:** Check ticket status and history
⚡ **Workflows:** Understand automation and workflows
📈 **SLA Policies:** Information about service level agreements
🔍 **Search:** Find specific tickets or information
🚀 **Escalations:** How to escalate urgent issues

Just ask me anything!`;
        }

        // No quick response matched
        return null;
    }
};

export default GeminiService;
