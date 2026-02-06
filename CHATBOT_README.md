# OpsMind AI Chatbot

## Overview
The OpsMind AI Chatbot is an intelligent assistant powered by **Ollama (Local AI)** that helps users with IT support, ticket management, and system queries. It provides instant responses and guidance through a beautiful, modern chat interface.

## Features

### 🤖 Intelligent Responses (Ollama Local AI)
- **Local AI Model**: Powered by Ollama running on your machine
- **100% Free**: No API costs or subscriptions
- **Private & Secure**: All data stays on your machine
- Natural language understanding
- Context-aware conversations
- Dynamic responses to complex queries
- **Quick Responses**: Pre-defined answers for common queries (instant response)
- Integration with ticket system

### 💬 Chat Interface
- Real-time messaging
- Typing indicators
- Message timestamps
- Smooth animations
- Mobile responsive design

### ⚡ Quick Actions
Pre-configured quick action buttons for common tasks:
- Create new tickets
- View open tickets
- Check ticket status
- Escalate tickets
- SLA policy information

### 📊 Analytics Dashboard
Real-time statistics:
- Total messages exchanged
- Queries resolved
- Average response time
- User satisfaction score

### 💾 Chat History
- Auto-save conversations
- Persistent storage (session-based)
- Export chat to text file
- Clear chat history

## Usage

### Accessing the Chatbot
1. Navigate to the sidebar
2. Under "AI & Automation" section
3. Click on "AI Chatbot"

### Sending Messages
1. Type your message in the input field
2. Press Enter or click the send button
3. Wait for AI response

### Quick Actions
- Click any quick action button
- The message will be auto-filled
- Press send or modify the message

### Managing Chat
- **Clear Chat**: Remove all messages (with confirmation)
- **Export Chat**: Download conversation as text file
- **Settings**: Configure chatbot preferences (coming soon)

## Supported Queries

### Ticket Management
- "How do I create a ticket?"
- "Show me my open tickets"
- "What's the status of ticket #1234?"
- "How do I escalate a ticket?"

### SLA & Policies
- "Tell me about SLA policies"
- "What are the response times?"
- "Service level agreements"

### Workflows & Automation
- "How do workflows work?"
- "What automations are available?"
- "Can I automate ticket assignment?"

### General Help
- "Help"
- "What can you do?"
- "Hello" / "Hi"

## Technical Details

### AI Integration
**Google Gemini Pro**
- API Key: Configured in `geminiService.js`
- Model: `gemini-pro`
- Context-aware responses with conversation history
- Temperature: 0.7 (balanced creativity/accuracy)
- Max tokens: 1024

### Response Strategy
The chatbot uses a **hybrid approach**:

1. **Quick Responses** (instant, no API call):
   - Greetings (Hello, Hi)
   - Thank you messages
   - Create ticket instructions
   - Check status instructions
   - Escalate ticket instructions
   - SLA policy information
   - Help menu

2. **Gemini AI** (for complex queries):
   - General IT support questions
   - Detailed troubleshooting
   - Custom scenarios
   - Follow-up questions
   - Contextual conversations

3. **Live Data Integration**:
   - "Show my tickets" → Fetches real tickets from backend
   - "My open tickets" → Displays actual ticket list

### File Structure
```
chatbot.html                           # Main chatbot page
assets/js/pages/chatbot.js            # Chatbot logic and functionality
services/geminiService.js             # Google Gemini AI integration (NEW)
components/sidebar.html               # Updated with chatbot link
```

### Dependencies
- Bootstrap 5 (UI framework)
- Bootstrap Icons
- **Google Gemini API** (AI/NLP)
- OpsMind UI module
- Ticket Service (for ticket integration)

### Integration Points

#### Google Gemini AI
The chatbot is integrated with Google's Gemini Pro model:
- **Service**: `services/geminiService.js`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Features**:
  - Context-aware responses
  - Conversation history (last 5 messages)
  - OpsMind-specific knowledge base
  - Fallback error handling

#### Ticket Service
The chatbot integrates with the ticket system to:
- Fetch user's open tickets
- Display ticket information
- Guide users through ticket operations

### Local Storage
Chat history is stored in browser's localStorage:
- Key: `opsmind_chat_history`
- Cleared daily (new session each day)
- Includes messages, stats, and timestamps

## Future Enhancements

### Phase 1 (Completed ✅)
- [x] Real AI integration (Google Gemini)
- [ ] Voice input/output
- [ ] Rich media messages (images, files)
- [ ] Multi-language support

### Phase 2 (Planned)
- [ ] Sentiment analysis
- [ ] Proactive suggestions
- [ ] Chat analytics dashboard
- [ ] User feedback system
- [ ] Fine-tune Gemini responses with user feedback

### Phase 3 (Planned)
- [ ] Integration with external systems
- [ ] Advanced workflow creation
- [ ] Custom bot training
- [ ] Team collaboration features
- [ ] Switch to Gemini 1.5 Pro (when available)

## Customization

### Changing AI Model Settings
To adjust Gemini AI behavior, edit `services/geminiService.js`:
```javascript
generationConfig: {
    temperature: 0.7,    // 0.0-1.0 (lower = more focused, higher = more creative)
    topK: 40,            // Limits vocabulary sampling
    topP: 0.95,          // Nucleus sampling threshold
    maxOutputTokens: 1024 // Maximum response length
}
```

### Updating API Key
If you need to change the API key, edit `services/geminiService.js`:
```javascript
const GEMINI_API_KEY = 'YOUR_NEW_API_KEY_HERE';
```

**⚠️ Security Note**: For production, store API keys in environment variables or backend configuration, not in frontend code.

### Styling
The chatbot uses inline styles for:
- Chat container layout
- Message bubbles
- Animations
- Responsive design

To customize colors, modify the gradient in `chatbot.html`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding Quick Responses
To add new quick response patterns, edit `getQuickResponse()` in `services/geminiService.js`:
```javascript
if (lowerMessage.includes('your-keyword')) {
    return 'Your custom response';
}
```

### Response Templates
Quick responses are handled before calling Gemini AI, making them instant and free. Add patterns in `geminiService.js`:
```javascript
getQuickResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('your-keyword')) {
        return 'Your custom instant response';
    }
    
    return null; // Falls through to Gemini AI
}
```

### Quick Actions
To add/modify quick actions, edit the `quick-actions` div in `chatbot.html`:
```html
<button class="quick-action-btn" data-message="Your message">
    <i class="bi bi-icon-name"></i> Button Text
</button>
```

### Modifying AI Context
To change how the AI understands OpsMind, edit `_buildContext()` in `services/geminiService.js`:
```javascript
_buildContext(conversationHistory) {
    let context = `You are OpsMind AI Assistant...
    
    Key features:
    - Add your custom feature descriptions
    - Update SLA policies
    - Modify platform information
    `;
    // ...
}
```

## API Usage & Costs

### Google Gemini API
- **Free Tier**: 60 requests per minute
- **Pricing**: Check [Google AI Pricing](https://ai.google.dev/pricing)
- **Current Model**: `gemini-pro` (text-only)
- **Rate Limiting**: Handled automatically by Google

### Optimization Tips
1. **Use Quick Responses**: Pre-defined answers don't consume API quota
2. **Conversation History**: Limited to last 5 messages to reduce token usage
3. **Max Tokens**: Set to 1024 for concise responses
4. **Cache Common Queries**: Quick responses handle frequent questions

## Troubleshooting

### Chatbot Not Responding
1. Check browser console for errors
2. Verify API key is correct in `geminiService.js`
3. Check network tab for API call failures
4. Ensure internet connectivity

### API Quota Exceeded
- **Error**: `429 Too Many Requests`
- **Solution**: Wait a minute or upgrade to paid tier
- **Prevention**: Implement rate limiting or use more quick responses

### Slow Responses
- Gemini API typically responds in 1-3 seconds
- Check network latency
- Quick responses are instant (no API call)

### CORS Errors
- Gemini API supports CORS by default
- If issues persist, proxy requests through your backend

## Security Considerations

### API Key Protection
⚠️ **Current Implementation**: API key is in frontend code (suitable for demo/development)

**For Production**:
1. Move API key to backend server
2. Create a proxy endpoint: `/api/chat`
3. Backend calls Gemini API with key
4. Frontend calls your backend
5. Implement rate limiting per user
6. Add authentication/authorization

### Example Backend Proxy (Node.js/Express)
```javascript
app.post('/api/chat', authenticateUser, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...req.body,
            key: apiKey
        })
    });
    res.json(await response.json());
});
```

## Support
For issues or questions about the chatbot feature, please contact the OpsMind development team.

## Version History
- **v1.1.0** (February 2026) - Google Gemini AI integration
  - Added real NLP model (Gemini Pro)
  - Hybrid response system (quick + AI)
  - Context-aware conversations
  - Live ticket integration
- **v1.0.0** (February 2026) - Initial release
  - Basic chat interface
  - Pattern-based responses
  - Quick actions
  - Export functionality

## Version
Current Version: 1.1.0 (Gemini AI Powered)
Last Updated: February 5, 2026
