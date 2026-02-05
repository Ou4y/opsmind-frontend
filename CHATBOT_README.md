# OpsMind AI Chatbot

## Overview
The OpsMind AI Chatbot is an intelligent assistant that helps users with IT support, ticket management, and system queries. It provides instant responses and guidance through a beautiful, modern chat interface.

## Features

### 🤖 Intelligent Responses
- Natural language understanding
- Context-aware responses
- Pattern matching for common queries
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

### File Structure
```
chatbot.html                           # Main chatbot page
assets/js/pages/chatbot.js            # Chatbot logic and functionality
components/sidebar.html               # Updated with chatbot link
```

### Dependencies
- Bootstrap 5 (UI framework)
- Bootstrap Icons
- OpsMind UI module
- Ticket Service (for ticket integration)
- AI Service (for future AI integration)

### Integration Points

#### Ticket Service
The chatbot integrates with the ticket system to:
- Fetch user's open tickets
- Display ticket information
- Guide users through ticket operations

#### AI Service
Ready for integration with:
- OpenAI GPT
- Custom AI models
- Backend AI endpoints

### Local Storage
Chat history is stored in browser's localStorage:
- Key: `opsmind_chat_history`
- Cleared daily (new session each day)
- Includes messages, stats, and timestamps

## Future Enhancements

### Phase 1 (Planned)
- [ ] Real AI integration (OpenAI/Custom model)
- [ ] Voice input/output
- [ ] Rich media messages (images, files)
- [ ] Multi-language support

### Phase 2 (Planned)
- [ ] Sentiment analysis
- [ ] Proactive suggestions
- [ ] Chat analytics dashboard
- [ ] User feedback system

### Phase 3 (Planned)
- [ ] Integration with external systems
- [ ] Advanced workflow creation
- [ ] Custom bot training
- [ ] Team collaboration features

## Customization

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

### Response Templates
To add new response patterns, edit the `getAIResponse()` function in `chatbot.js`:
```javascript
if (lowerMessage.includes('your-keyword')) {
    return 'Your custom response';
}
```

### Quick Actions
To add/modify quick actions, edit the `quick-actions` div in `chatbot.html`:
```html
<button class="quick-action-btn" data-message="Your message">
    <i class="bi bi-icon-name"></i> Button Text
</button>
```

## Support
For issues or questions about the chatbot feature, please contact the OpsMind development team.

## Version
Current Version: 1.0.0
Last Updated: February 2026
